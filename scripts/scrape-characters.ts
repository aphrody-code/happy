/**
 * Script de scraping des personnages importants de Fairy Tail
 *
 * Scrappe les pages du wiki FR Fairy Tail pour ~45 personnages importants
 * et génère des fichiers markdown individuels dans soul/characters/<nom>/
 *
 * Usage:
 *   npx tsx scripts/scrape-characters.ts                    # Tous les personnages
 *   npx tsx scripts/scrape-characters.ts --limit=5          # 5 premiers seulement
 *   npx tsx scripts/scrape-characters.ts --verbose          # Logs détaillés
 *   npx tsx scripts/scrape-characters.ts --dry-run          # Scrape sans écrire
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CheerioAPI, Element } from 'cheerio'
import { CheerioCrawler, Configuration, log, LogLevel } from 'crawlee'

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = 'https://fairy-tail.fandom.com'
const WIKI_BASE = `${BASE_URL}/fr/wiki`
const API_URL = `${BASE_URL}/fr/api.php`
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.resolve(SCRIPT_DIR, '../soul/characters')
const STORAGE_DIR = path.resolve(SCRIPT_DIR, '../.storage/characters')

Configuration.getGlobalConfig().set('storageClientOptions', { localDataDirectory: STORAGE_DIR })

// ─── Types ───────────────────────────────────────────────────────────────────

type CharacterDef = {
	frName: string
	tier: 1 | 2
}

type SubPage = {
	title: string
	url: string
}

type InfoboxField = {
	source: string
	label: string
	value: string
}

type Section = {
	title: string
	level: number
	content: string
}

type PageData = {
	url: string
	pageName: string
	infobox: InfoboxField[]
	sections: Section[]
}

type CharacterData = {
	def: CharacterDef
	slug: string
	pages: PageData[]
	subPages: SubPage[]
}

type GeneratedFile = {
	name: string
	path: string
	hasContent: boolean
}

// ─── Liste des personnages ───────────────────────────────────────────────────

const CHARACTERS: CharacterDef[] = [
	// Tier 0 — Happy (protagoniste du bot)
	{ frName: 'Happy', tier: 1 },

	// Tier 1 — Personnages majeurs (pages avec sous-pages)
	{ frName: 'Natsu Dragnir', tier: 1 },
	{ frName: 'Lucy Heartfilia', tier: 1 },
	{ frName: 'Grey Fullbuster', tier: 1 },
	{ frName: 'Erza Scarlett', tier: 1 },
	{ frName: 'Wendy Marvel', tier: 1 },
	{ frName: 'Gajil Redfox', tier: 1 },
	{ frName: 'Luxus Draer', tier: 1 },
	{ frName: 'Mirajane Strauss', tier: 1 },
	{ frName: 'Makarof Draer', tier: 1 },
	{ frName: 'Gerald Fernandez', tier: 1 },
	{ frName: 'Jubia Lokser', tier: 1 },
	{ frName: 'Ultia Milkovich', tier: 1 },
	{ frName: 'Elfman Strauss', tier: 1 },

	// Tier 2 — Personnages importants (page unique)
	{ frName: 'Carla', tier: 2 },
	{ frName: 'Mavis Vermillion', tier: 2 },
	{ frName: 'Zeleph Dragnir', tier: 2 },
	{ frName: 'Acnologia', tier: 2 },
	{ frName: 'Hades', tier: 2 },
	{ frName: 'Gildarts Clive', tier: 2 },
	{ frName: 'Lisana Strauss', tier: 2 },
	{ frName: 'Reby MacGarden', tier: 2 },
	{ frName: 'Kanna Alperona', tier: 2 },
	{ frName: 'Fried Justin', tier: 2 },
	{ frName: 'Bixrow', tier: 2 },
	{ frName: 'Ever Green', tier: 2 },
	{ frName: 'Erick', tier: 2 },
	{ frName: 'Meldy', tier: 2 },
	{ frName: 'Leon Bastia', tier: 2 },
	{ frName: 'Léo', tier: 2 },
	{ frName: 'Ignir', tier: 2 },
	{ frName: 'Sting Youclif', tier: 2 },
	{ frName: 'Rog Chenny', tier: 2 },
	{ frName: 'Minerva Orlando', tier: 2 },
	{ frName: 'Kagura Mikazuchi', tier: 2 },
	{ frName: 'Silver Fullbuster', tier: 2 },
	{ frName: 'Eileen Belserion', tier: 2 },
	{ frName: 'Brandish Myuh', tier: 2 },
	{ frName: 'August', tier: 2 },
	{ frName: 'Rahkeid Dragnir', tier: 2 },
	{ frName: 'Inbel Yura', tier: 2 },
	{ frName: 'Panther Lily', tier: 2 },
]

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function slugify(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036F]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
}

function normalizeTitle(title: string): string {
	return title
		.normalize('NFD')
		.replace(/[\u0300-\u036F]/g, '')
		.toLowerCase()
		.trim()
}

function encodeWikiTitle(title: string): string {
	return encodeURIComponent(title.replace(/ /g, '_'))
}

// ─── Découverte des sous-pages via API MediaWiki ─────────────────────────────

async function discoverSubPages(frName: string): Promise<SubPage[]> {
	const prefix = `${frName}/`
	const url = `${API_URL}?action=query&list=allpages&apprefix=${encodeURIComponent(prefix)}&aplimit=50&format=json`

	try {
		const res = await fetch(url)
		if (!res.ok) {
			log.warning(`API erreur pour ${frName}: ${res.status}`)

			return []
		}

		const data = await res.json() as { query?: { allpages?: Array<{ title: string }> } }
		const pages = data.query?.allpages ?? []

		return pages.map(p => ({
			title: p.title,
			url: `${WIKI_BASE}/${encodeWikiTitle(p.title)}`,
		}))
	} catch (err) {
		log.warning(`Erreur découverte sous-pages pour ${frName}: ${err}`)

		return []
	}
}

// ─── Parsing HTML → Markdown ─────────────────────────────────────────────────

function cleanText(text: string): string {
	return text
		.replace(/\[\d+\]/g, '') // [1], [2], etc.
		.replace(/\(\?\)/g, '') // (?)
		.replace(/\[modifier\]/g, '') // [modifier]
		.replace(/\[modifier le wikicode\]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
}

function htmlToMarkdown($: CheerioAPI, el: Element): string {
	const $el = $(el)

	// Supprimer les éléments indésirables
	$el.find('sup.reference, .reference, .mw-editsection, .navbox, .noprint, .toc, script, style, .pi-navigation').remove()

	const parts: string[] = []

	$el.children().each((_, child) => {
		const $child = $(child)
		const tag = (child as Element).tagName?.toLowerCase()

		switch (tag) {
			case 'p': {
				const text = cleanText($child.text())
				if (text) parts.push(`${text}\n`)
				break
			}

			case 'ul': {
				$child.children('li').each((_, li) => {
					const text = cleanText($(li).text())
					if (text) parts.push(`- ${text}`)
				})
				parts.push('')
				break
			}

			case 'ol': {
				let idx = 1
				$child.children('li').each((_, li) => {
					const text = cleanText($(li).text())
					if (text) {
						parts.push(`${idx}. ${text}`)
						idx++
					}
				})
				parts.push('')
				break
			}

			case 'dl': {
				$child.children().each((_, dlChild) => {
					const $dlChild = $(dlChild)
					const dlTag = (dlChild as Element).tagName?.toLowerCase()
					const text = cleanText($dlChild.text())
					if (!text) return
					if (dlTag === 'dt') parts.push(`**${text}**`)
					else if (dlTag === 'dd') parts.push(`  ${text}`)
				})
				parts.push('')
				break
			}

			case 'table': {
				const rows: string[][] = []
				$child.find('tr').each((_, tr) => {
					const cells: string[] = []
					$(tr).find('th, td').each((_, cell) => {
						cells.push(cleanText($(cell).text()))
					})
					if (cells.length > 0) rows.push(cells)
				})
				if (rows.length > 0) {
					const maxCols = Math.max(...rows.map(r => r.length))
					for (const row of rows) {
						while (row.length < maxCols) row.push('')
					}
					// Header row
					parts.push(`| ${rows[0].join(' | ')} |`)
					parts.push(`|${rows[0].map(() => '---').join('|')}|`)
					for (let i = 1; i < rows.length; i++) {
						parts.push(`| ${rows[i].join(' | ')} |`)
					}
					parts.push('')
				}
				break
			}

			case 'h3': {
				const text = cleanText($child.text())
				if (text) parts.push(`### ${text}\n`)
				break
			}

			case 'h4': {
				const text = cleanText($child.text())
				if (text) parts.push(`#### ${text}\n`)
				break
			}

			case 'blockquote': {
				const text = cleanText($child.text())
				if (text) parts.push(`> *"${text}"*\n`)
				break
			}

			case 'div': {
				// Recurse into divs
				const inner = htmlToMarkdown($, child)
				if (inner.trim()) parts.push(inner)
				break
			}

			default: {
				const text = cleanText($child.text())
				if (text && text.length > 10) parts.push(`${text}\n`)
				break
			}
		}
	})

	return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

// ─── Parsing de l'infobox ────────────────────────────────────────────────────

function parseInfobox($: CheerioAPI): InfoboxField[] {
	const fields: InfoboxField[] = []

	$('aside.portable-infobox [data-source]').each((_, el) => {
		const $el = $(el)
		const source = $el.attr('data-source') ?? ''
		const label = cleanText($el.find('.pi-data-label').text()) || source
		const $value = $el.find('.pi-data-value')

		let value: string
		if ($value.length > 0) {
			// Handle <br> separated values
			$value.find('br').replaceWith('\n')
			value = cleanText($value.text())
		} else {
			value = cleanText($el.text())
		}

		if (source && value) {
			fields.push({ source, label, value })
		}
	})

	// Also get the character name from the infobox title
	const title = cleanText($('aside.portable-infobox .pi-title').text())
	if (title) {
		fields.unshift({ source: 'name', label: 'Nom', value: title })
	}

	// Get image if available
	const imgSrc = $('aside.portable-infobox .pi-image-thumbnail').attr('src')
	if (imgSrc) {
		fields.push({ source: 'image', label: 'Image', value: imgSrc })
	}

	return fields
}

// ─── Extraction des sections ─────────────────────────────────────────────────

function extractSections($: CheerioAPI): Section[] {
	const sections: Section[] = []
	const content = $('.mw-parser-output')

	// Remove unwanted elements
	content.find('sup.reference, .reference, .mw-editsection, .navbox, .noprint, .toc, script, style, .pi-navigation, aside.portable-infobox').remove()

	let currentTitle = 'Introduction'
	let currentLevel = 2
	let currentElements: Element[] = []

	const flushSection = () => {
		if (currentElements.length > 0) {
			const wrapper = $('<div></div>')
			currentElements.forEach(el => wrapper.append($(el).clone()))
			const md = htmlToMarkdown($, wrapper[0] as Element)
			if (md.trim()) {
				sections.push({
					title: currentTitle,
					level: currentLevel,
					content: md,
				})
			}
		}
		currentElements = []
	}

	content.children().each((_, child) => {
		const tag = (child as Element).tagName?.toLowerCase()

		if (tag === 'h2') {
			flushSection()
			currentTitle = cleanText($(child).find('.mw-headline').text() || $(child).text())
			currentLevel = 2
		} else if (tag === 'h3') {
			// H3 sections are sub-sections, include them in content as markdown headers
			currentElements.push(child)
		} else {
			currentElements.push(child)
		}
	})
	flushSection()

	return sections
}

// ─── Scraping avec CheerioCrawler ────────────────────────────────────────────

async function scrapeCharacters(characters: CharacterDef[], verbose: boolean): Promise<CharacterData[]> {
	const characterDataMap = new Map<string, CharacterData>()

	// Phase 1: Découverte des sous-pages
	log.info(`Phase 1: Découverte des sous-pages pour ${characters.length} personnages...`)

	for (const def of characters) {
		const slug = slugify(def.frName)
		const subPages = def.tier === 1 ? await discoverSubPages(def.frName) : []

		if (subPages.length > 0) {
			log.info(`  ${def.frName}: ${subPages.length} sous-pages trouvées`)
			if (verbose) {
				subPages.forEach(sp => log.debug(`    - ${sp.title}`))
			}
		}

		characterDataMap.set(slug, {
			def,
			slug,
			pages: [],
			subPages,
		})
	}

	// Phase 2: Préparer les URLs à scraper
	const urlToCharacter = new Map<string, { slug: string, pageName: string }>()
	const urls: string[] = []

	for (const [slug, charData] of characterDataMap) {
		// Page principale
		const mainUrl = `${WIKI_BASE}/${encodeWikiTitle(charData.def.frName)}`
		urlToCharacter.set(mainUrl, { slug, pageName: charData.def.frName })
		urls.push(mainUrl)

		// Sous-pages
		for (const sp of charData.subPages) {
			urlToCharacter.set(sp.url, { slug, pageName: sp.title })
			urls.push(sp.url)
		}
	}

	log.info(`Phase 2: Scraping de ${urls.length} pages...`)

	// Phase 3: Scraping concurrent
	const crawler = new CheerioCrawler({
		maxConcurrency: 5,
		maxRequestRetries: 3,
		requestHandlerTimeoutSecs: 30,

		async requestHandler({ request, $ }) {
			const mapping = urlToCharacter.get(request.url)
			if (!mapping) {
				log.warning(`URL non mappée: ${request.url}`)

				return
			}

			const { slug, pageName } = mapping

			const infobox = parseInfobox($)
			const sections = extractSections($)

			const pageData: PageData = {
				url: request.url,
				pageName,
				infobox,
				sections,
			}

			const charData = characterDataMap.get(slug)
			if (charData) {
				charData.pages.push(pageData)
			}

			if (verbose) {
				log.debug(`  ✓ ${pageName} — ${infobox.length} champs infobox, ${sections.length} sections`)
			}
		},

		failedRequestHandler({ request }) {
			const mapping = urlToCharacter.get(request.url)
			log.warning(`✗ Échec: ${mapping?.pageName ?? request.url}`)
		},
	})

	await crawler.run(urls)

	const results = Array.from(characterDataMap.values())
	log.info(`Scraping terminé: ${results.length} personnages, ${urls.length} pages traitées`)

	return results
}

// ─── Génération des fichiers markdown ────────────────────────────────────────

function findSection(pages: PageData[], ...titlePatterns: string[]): Section | undefined {
	for (const page of pages) {
		for (const section of page.sections) {
			const normalizedTitle = normalizeTitle(section.title)
			for (const pattern of titlePatterns) {
				if (normalizedTitle.includes(normalizeTitle(pattern))) {
					return section
				}
			}
		}
	}

	return undefined
}

function findSectionsStartingWith(pages: PageData[], ...prefixes: string[]): Section[] {
	const found: Section[] = []
	for (const page of pages) {
		for (const section of page.sections) {
			const normalizedTitle = normalizeTitle(section.title)
			for (const prefix of prefixes) {
				if (normalizedTitle.startsWith(normalizeTitle(prefix))) {
					found.push(section)
				}
			}
		}
	}

	return found
}

function getMainPageInfobox(pages: PageData[]): InfoboxField[] {
	// The main page is usually the first one without a "/" in the pageName
	const mainPage = pages.find(p => !p.pageName.includes('/'))

	return mainPage?.infobox ?? pages[0]?.infobox ?? []
}

function generateIdentity(charData: CharacterData): string {
	const { def, pages } = charData
	const infobox = getMainPageInfobox(pages)
	const apparenceSection = findSection(pages, 'Apparence', 'Appearance')

	const lines: string[] = [`# ${def.frName}`, '']

	// Infobox as markdown table
	if (infobox.length > 0) {
		lines.push('## Fiche d\'identité', '')
		lines.push('| Champ | Valeur |')
		lines.push('|-------|--------|')
		for (const field of infobox) {
			if (field.source === 'image') continue
			lines.push(`| **${field.label}** | ${field.value} |`)
		}
		lines.push('')
	}

	// Apparence
	if (apparenceSection) {
		lines.push('## Apparence', '')
		lines.push(apparenceSection.content)
		lines.push('')
	}

	return `${lines.join('\n').trim()}\n`
}

function generatePersonality(charData: CharacterData): string {
	const section = findSection(charData.pages, 'Personnalité', 'Personnalite', 'Caractère', 'Caractere')

	const lines: string[] = [`# Personnalité — ${charData.def.frName}`, '']

	if (section) {
		lines.push(section.content)
	} else {
		lines.push('*Aucun contenu trouvé sur le wiki.*')
	}

	return `${lines.join('\n').trim()}\n`
}

function generateAbilities(charData: CharacterData): string {
	// Look in sub-pages first (e.g., "Natsu Dragnir/Aptitudes et Compétences")
	const aptitudesPages = charData.pages.filter(p =>
		p.pageName.includes('/Aptitudes') || p.pageName.includes('/Compétences') || p.pageName.includes('/Competences')
	)

	const lines: string[] = [`# Aptitudes et Compétences — ${charData.def.frName}`, '']

	if (aptitudesPages.length > 0) {
		// Use all sections from the aptitudes sub-page
		for (const page of aptitudesPages) {
			for (const section of page.sections) {
				lines.push(`## ${section.title}`, '')
				lines.push(section.content)
				lines.push('')
			}
		}
	} else {
		// Fallback to main page section
		const section = findSection(charData.pages, 'Aptitudes', 'Compétences', 'Competences', 'Magie', 'Capacités', 'Capacites', 'Pouvoirs')
		if (section) {
			lines.push(section.content)
		} else {
			lines.push('*Aucun contenu trouvé sur le wiki.*')
		}
	}

	return `${lines.join('\n').trim()}\n`
}

function generateHistory(charData: CharacterData): string {
	// Look in sub-pages first (e.g., "Natsu Dragnir/Histoire (X784)")
	const historyPages = charData.pages.filter(p =>
		p.pageName.includes('/Histoire')
	)

	const lines: string[] = [`# Histoire — ${charData.def.frName}`, '']

	if (historyPages.length > 0) {
		for (const page of historyPages) {
			// Extract the period from the page name, e.g. "Histoire (X784)"
			const match = page.pageName.match(/\/(.+)$/)
			const subTitle = match ? match[1] : page.pageName
			lines.push(`## ${subTitle}`, '')

			for (const section of page.sections) {
				if (section.title !== 'Introduction') {
					lines.push(`### ${section.title}`, '')
				}
				lines.push(section.content)
				lines.push('')
			}
		}
	} else {
		// Fallback to main page sections about history
		const historySections = findSectionsStartingWith(charData.pages, 'Histoire', 'Biographie', 'Passé', 'Passe', 'Arc ')
		const singleHistorySection = findSection(charData.pages, 'Histoire', 'Biographie')

		if (historySections.length > 0) {
			for (const section of historySections) {
				lines.push(`## ${section.title}`, '')
				lines.push(section.content)
				lines.push('')
			}
		} else if (singleHistorySection) {
			lines.push(singleHistorySection.content)
		} else {
			lines.push('*Aucun contenu trouvé sur le wiki.*')
		}
	}

	return `${lines.join('\n').trim()}\n`
}

function generateQuotes(charData: CharacterData): string {
	// Look in /Divers sub-page first, then main page
	const diversPages = charData.pages.filter(p => p.pageName.includes('/Divers'))

	const lines: string[] = [`# Citations — ${charData.def.frName}`, '']

	let section: Section | undefined
	if (diversPages.length > 0) {
		section = findSection(diversPages, 'Citations', 'Citation')
	}
	if (!section) {
		section = findSection(charData.pages, 'Citations', 'Citation')
	}

	if (section) {
		lines.push(section.content)
	} else {
		lines.push('*Aucun contenu trouvé sur le wiki.*')
	}

	return `${lines.join('\n').trim()}\n`
}

function generateBattles(charData: CharacterData): string {
	const diversPages = charData.pages.filter(p => p.pageName.includes('/Divers'))

	const lines: string[] = [`# Combats — ${charData.def.frName}`, '']

	let section: Section | undefined
	if (diversPages.length > 0) {
		section = findSection(diversPages, 'Combats', 'Combat')
	}
	if (!section) {
		section = findSection(charData.pages, 'Combats', 'Combat')
	}

	if (section) {
		lines.push(section.content)
	} else {
		lines.push('*Aucun contenu trouvé sur le wiki.*')
	}

	return `${lines.join('\n').trim()}\n`
}

function generateTrivia(charData: CharacterData): string {
	const diversPages = charData.pages.filter(p => p.pageName.includes('/Divers'))

	const lines: string[] = [`# Détails supplémentaires — ${charData.def.frName}`, '']

	let section: Section | undefined
	if (diversPages.length > 0) {
		section = findSection(diversPages, 'Détails', 'Details', 'Anecdotes', 'Trivia', 'Divers')
	}
	if (!section) {
		section = findSection(charData.pages, 'Détails', 'Details', 'Anecdotes', 'Trivia', 'Futilités', 'Futilites')
	}

	// If still no dedicated section, grab everything from /Divers that's not citations/combats
	if (!section && diversPages.length > 0) {
		const allContent: string[] = []
		for (const page of diversPages) {
			for (const s of page.sections) {
				const nt = normalizeTitle(s.title)
				if (!nt.includes('citation') && !nt.includes('combat') && !nt.includes('introduction')) {
					allContent.push(`## ${s.title}\n\n${s.content}`)
				}
			}
		}
		if (allContent.length > 0) {
			lines.push(allContent.join('\n\n'))

			return `${lines.join('\n').trim()}\n`
		}
	}

	if (section) {
		lines.push(section.content)
	} else {
		lines.push('*Aucun contenu trouvé sur le wiki.*')
	}

	return `${lines.join('\n').trim()}\n`
}

function generateRelationships(charData: CharacterData): string {
	const section = findSection(charData.pages, 'Relations', 'Relation')

	const lines: string[] = [`# Relations — ${charData.def.frName}`, '']

	if (section) {
		lines.push(section.content)
	} else {
		// Placeholder from infobox
		const infobox = getMainPageInfobox(charData.pages)
		const relevantFields = infobox.filter((f) => {
			const s = f.source.toLowerCase()

			return s.includes('guild') || s.includes('guilde') || s.includes('equipe')
				|| s.includes('team') || s.includes('affiliation') || s.includes('partenaire')
				|| s.includes('partner') || s.includes('famille') || s.includes('family')
		})

		if (relevantFields.length > 0) {
			lines.push('*Pas de section "Relations" sur le wiki. Informations extraites de l\'infobox :*', '')
			for (const field of relevantFields) {
				lines.push(`- **${field.label}** : ${field.value}`)
			}
		} else {
			lines.push('*Aucun contenu trouvé sur le wiki.*')
		}
	}

	return `${lines.join('\n').trim()}\n`
}

// ─── Écriture des fichiers ───────────────────────────────────────────────────

function writeCharacterFiles(charData: CharacterData, dryRun: boolean): GeneratedFile[] {
	const charDir = path.join(OUTPUT_DIR, charData.slug)
	const files: GeneratedFile[] = []

	const generators: Array<{ name: string, fn: (cd: CharacterData) => string }> = [
		{ name: 'identity.md', fn: generateIdentity },
		{ name: 'personality.md', fn: generatePersonality },
		{ name: 'abilities.md', fn: generateAbilities },
		{ name: 'history.md', fn: generateHistory },
		{ name: 'quotes.md', fn: generateQuotes },
		{ name: 'battles.md', fn: generateBattles },
		{ name: 'trivia.md', fn: generateTrivia },
		{ name: 'relationships.md', fn: generateRelationships },
	]

	if (!dryRun) {
		fs.mkdirSync(charDir, { recursive: true })
	}

	for (const gen of generators) {
		const content = gen.fn(charData)
		const filePath = path.join(charDir, gen.name)
		const hasContent = !content.includes('*Aucun contenu trouvé sur le wiki.*')

		if (!dryRun) {
			fs.writeFileSync(filePath, content, 'utf-8')
		}

		files.push({ name: gen.name, path: filePath, hasContent })
	}

	return files
}

// ─── Rapport final ───────────────────────────────────────────────────────────

function printReport(results: Array<{ charData: CharacterData, files: GeneratedFile[] }>) {
	console.log(`\n${'═'.repeat(80)}`)
	console.log('  RAPPORT DE GÉNÉRATION')
	console.log('═'.repeat(80))

	const colName = 28
	const fileNames = ['identity', 'personality', 'abilities', 'history', 'quotes', 'battles', 'trivia', 'relations']

	// Header
	let header = 'Personnage'.padEnd(colName)
	for (const fn of fileNames) {
		header += fn.slice(0, 7).padEnd(9)
	}
	header += 'Pages'
	console.log(header)
	console.log('─'.repeat(header.length))

	let totalFiles = 0
	let totalWithContent = 0

	for (const { charData, files } of results) {
		let row = charData.def.frName.slice(0, colName - 2).padEnd(colName)
		for (const file of files) {
			row += (file.hasContent ? '✓' : '·').padEnd(9)
			totalFiles++
			if (file.hasContent) totalWithContent++
		}
		row += `${charData.pages.length}`
		console.log(row)
	}

	console.log('─'.repeat(80))
	console.log(`Total: ${results.length} personnages, ${totalWithContent}/${totalFiles} fichiers avec contenu`)
	console.log(`${'═'.repeat(80)}\n`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
	const args = process.argv.slice(2)
	const limitArg = args.find(a => a.startsWith('--limit='))
	const limit = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : undefined
	const verbose = args.includes('--verbose')
	const dryRun = args.includes('--dry-run')

	log.setLevel(verbose ? LogLevel.DEBUG : LogLevel.INFO)

	const characters = limit ? CHARACTERS.slice(0, limit) : CHARACTERS

	log.info(`=== Scraping de ${characters.length} personnages Fairy Tail ===`)
	if (dryRun) log.info('Mode dry-run: aucun fichier ne sera écrit')

	// Scrape
	const allCharData = await scrapeCharacters(characters, verbose)

	// Sort by original order
	allCharData.sort((a, b) => {
		const ia = CHARACTERS.findIndex(c => c.frName === a.def.frName)
		const ib = CHARACTERS.findIndex(c => c.frName === b.def.frName)

		return ia - ib
	})

	// Generate files
	log.info(`Phase 3: Génération des fichiers markdown...`)

	if (!dryRun) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true })
	}

	const results: Array<{ charData: CharacterData, files: GeneratedFile[] }> = []

	for (const charData of allCharData) {
		if (charData.pages.length === 0) {
			log.warning(`⚠ ${charData.def.frName}: aucune page scrapée, skip`)
			continue
		}

		const files = writeCharacterFiles(charData, dryRun)
		results.push({ charData, files })

		const withContent = files.filter(f => f.hasContent).length
		log.info(`  ${charData.def.frName} → ${withContent}/${files.length} fichiers ${dryRun ? '(dry-run)' : 'générés'}`)
	}

	// Report
	printReport(results)

	if (!dryRun) {
		log.info(`Fichiers générés dans: ${OUTPUT_DIR}`)
	}
}

main().catch((err) => {
	log.error('Erreur fatale:', err)
	process.exit(1)
})

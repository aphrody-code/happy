/**
 * Script de scraping du wiki Fairy Tail FR via Crawlee (CheerioCrawler)
 *
 * Utilise Crawlee pour scraper toutes les pages du wiki avec :
 * - Gestion automatique de la file d'attente (RequestQueue)
 * - Retry automatique en cas d'erreur
 * - Concurrence configurable
 * - Stockage structuré (Dataset)
 *
 * Usage:
 *   npx tsx scripts/scrape-wiki.ts                          # Liste toutes les pages (4781+)
 *   npx tsx scripts/scrape-wiki.ts --detailed --limit=50    # Scrape contenu + catégories
 *   npx tsx scripts/scrape-wiki.ts --characters-only        # Personnages via FandomPersonalScraper
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { CheerioCrawler, Configuration, Dataset, log, LogLevel } from 'crawlee'

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = 'https://fairy-tail.fandom.com'
const ALL_PAGES_URL = `${BASE_URL}/fr/wiki/Sp%C3%A9cial:Toutes_les_pages`
const CHARACTERS_URL = `${BASE_URL}/fr/wiki/Cat%C3%A9gorie:Personnages`
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.resolve(SCRIPT_DIR, '../data')
const STORAGE_DIR = path.resolve(SCRIPT_DIR, '../.storage')

// Crawlee utilise ce dossier pour le stockage interne (queue, datasets, etc.)
Configuration.getGlobalConfig().set('storageClientOptions', { localDataDirectory: STORAGE_DIR })

// ─── Types ───────────────────────────────────────────────────────────────────

type WikiPage = {
	name: string
	url: string
}

type WikiPageDetailed = {
	categories: string[]
	content: string
} & WikiPage

// ─── 1. Lister TOUTES les pages via Spécial:Toutes_les_pages ────────────────
//    Parcourt la pagination MediaWiki automatiquement via CheerioCrawler

async function scrapeAllPages(): Promise<WikiPage[]> {
	const pages: WikiPage[] = []

	log.info('=== Scraping de toutes les pages du wiki Fairy Tail FR ===')

	const crawler = new CheerioCrawler({
		maxConcurrency: 3,
		maxRequestRetries: 3,
		requestHandlerTimeoutSecs: 30,

		async requestHandler({ request, $, enqueueLinks, log: crawlLog }) {
			// Extraire tous les liens de la liste AllPages
			$('.mw-allpages-body li a').each((_, el) => {
				const href = $(el).attr('href')
				const name = $(el).text().trim()
				if (href && name) {
					pages.push({ name, url: `${BASE_URL}${href}` })
				}
			})

			crawlLog.info(`${request.loadedUrl} -> ${pages.length} pages collectées`)

			// Suivre la pagination "Page suivante"
			const nextLink = $('.mw-allpages-nav a').filter((_, el) =>
				($(el).text() || '').includes('Page suivante')
			)

			if (nextLink.length > 0) {
				const href = nextLink.attr('href')
				if (href) {
					const nextUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`
					await enqueueLinks({ urls: [nextUrl] })
				}
			}
		},

		failedRequestHandler({ request, log: crawlLog }) {
			crawlLog.error(`Échec de ${request.url} après retries`)
		},
	})

	await crawler.run([ALL_PAGES_URL])

	log.info(`Total: ${pages.length} pages récupérées`)

	return pages
}

// ─── 2. Scraping détaillé via CheerioCrawler (concurrence + retry) ──────────

async function scrapeDetailed(pages: WikiPage[], limit?: number): Promise<WikiPageDetailed[]> {
	const detailedPages: WikiPageDetailed[] = []
	const urlToPage = new Map(pages.map(p => [p.url, p]))
	const pagesToScrape = limit ? pages.slice(0, limit) : pages

	log.info(`=== Scraping détaillé de ${pagesToScrape.length} pages ===`)

	const crawler = new CheerioCrawler({
		minConcurrency: 5,
		maxConcurrency: 15,
		maxRequestRetries: 3,
		requestHandlerTimeoutSecs: 30,

		async requestHandler({ request, $, log: crawlLog }) {
			const page = urlToPage.get(request.url)
			if (!page) return

			// Catégories
			const categories: string[] = []
			$('.page-header__categories a, .categories a').each((_, el) => {
				const text = $(el).text().trim()
				if (text) categories.push(text)
			})

			// Contenu textuel principal
			const contentParts: string[] = []
			$('.mw-parser-output > p').each((_, el) => {
				const text = $(el).text().trim()
				if (text) contentParts.push(text)
			})

			detailedPages.push({
				...page,
				categories: [...new Set(categories)],
				content: contentParts.join('\n'),
			})

			if (detailedPages.length % 100 === 0) {
				crawlLog.info(`Progression: ${detailedPages.length}/${pagesToScrape.length}`)
			}
		},

		failedRequestHandler({ request, log: crawlLog }) {
			crawlLog.warning(`Échec: ${request.url}`)
		},
	})

	await crawler.run(pagesToScrape.map(p => p.url))

	log.info(`${detailedPages.length} pages scrapées avec détails`)

	return detailedPages
}

// ─── 3. Scraping des personnages via FandomPersonalScraper ──────────────────

async function scrapeCharacters(limit: number = 50) {
	log.info('=== Scraping des personnages via FandomPersonalScraper ===')

	const { FandomPersonalScraper } = await import('fandomscraper')

	const scraper = new FandomPersonalScraper({
		url: CHARACTERS_URL,
		pageFormat: 'classic' as const,
		dataSource: {
			kanji: 'Kanji',
			romaji: 'Rōmaji',
			status: 'Statut',
			species: 'Race',
			gender: 'Sexe',
			age: 'Âge',
			birthday: 'Anniversaire',
			affiliation: 'Guilde',
			occupations: 'Occupation',
			images: {
				identifier: '.pi-image-thumbnail',
				get(page: Document) {
					return page.querySelectorAll(this.identifier)
				},
			},
		},
	})

	const characters = await scraper
		.findAll({ base64: false, recursive: true, withId: true })
		.limit(limit)
		.attr('kanji romaji status species gender age birthday affiliation occupations images')
		.attrToArray('affiliation occupations')
		.exec()

	log.info(`${(characters as any[]).length} personnages récupérés`)

	return characters
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
	const args = process.argv.slice(2)
	const charactersOnly = args.includes('--characters-only')
	const detailedMode = args.includes('--detailed')
	const limitArg = args.find(a => a.startsWith('--limit='))
	const limit = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : undefined

	log.setLevel(args.includes('--verbose') ? LogLevel.DEBUG : LogLevel.INFO)

	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true })
	}

	// ── Mode personnages uniquement ──
	if (charactersOnly) {
		const characters = await scrapeCharacters(limit ?? 50)
		const outputPath = path.join(OUTPUT_DIR, 'characters.json')
		fs.writeFileSync(outputPath, JSON.stringify({
			scrapedAt: new Date().toISOString(),
			totalCharacters: (characters as any[]).length,
			characters,
		}, null, 2))
		log.info(`Sauvegardé dans ${outputPath}`)

		return
	}

	// ── Étape 1 : Lister toutes les pages ──
	const allPages = await scrapeAllPages()

	// ── Étape 2 : Scraping détaillé ou simple listing ──
	if (detailedMode) {
		const detailedPages = await scrapeDetailed(allPages, limit)

		const outputPath = path.join(OUTPUT_DIR, 'wiki-pages-detailed.json')
		fs.writeFileSync(outputPath, JSON.stringify({
			scrapedAt: new Date().toISOString(),
			totalPages: detailedPages.length,
			pages: detailedPages,
		}, null, 2))
		log.info(`Sauvegardé dans ${outputPath}`)

		// Aussi sauvegarder dans le Dataset Crawlee
		for (const page of detailedPages) {
			await Dataset.pushData(page)
		}
		log.info(`Dataset Crawlee: ${STORAGE_DIR}/datasets/`)
	} else {
		const outputPath = path.join(OUTPUT_DIR, 'wiki-pages.json')
		fs.writeFileSync(outputPath, JSON.stringify({
			scrapedAt: new Date().toISOString(),
			totalPages: allPages.length,
			pages: allPages,
		}, null, 2))
		log.info(`Sauvegardé dans ${outputPath}`)
	}
}

main().catch((err) => {
	log.error('Erreur fatale:', err)
	process.exit(1)
})

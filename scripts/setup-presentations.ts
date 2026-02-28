/**
 * Script pour envoyer les présentations des personnages Fairy Tail
 * dans un salon Discord via des embeds riches.
 *
 * Lit les fichiers soul/characters/<slug>/identity.md et personality.md
 * pour générer un embed par personnage avec : infobox, apparence, personnalité.
 *
 * Usage:
 *   npx tsx scripts/setup-presentations.ts                   # Tous les personnages
 *   npx tsx scripts/setup-presentations.ts --limit=5         # 5 premiers seulement
 *   npx tsx scripts/setup-presentations.ts --dry-run         # Affiche sans envoyer
 */

import 'dotenv/config'

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Client, EmbedBuilder, GatewayIntentBits, TextChannel } from 'discord.js'

// ─── Config ──────────────────────────────────────────────────────────────────

const CHANNEL_ID = '1477117912207593645'
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const CHARACTERS_DIR = path.resolve(SCRIPT_DIR, '../soul/characters')
const WIKI_BASE = 'https://fairy-tail.fandom.com/fr/wiki'
const API_URL = 'https://fairy-tail.fandom.com/fr/api.php'

// Couleurs par "groupe" de personnages
const COLORS: Record<string, number> = {
	'fairy-tail': 0xE8672A, // Orange Fairy Tail
	'villain': 0x8B0000, // Rouge sombre
	'sabertooth': 0xFFD700, // Or
	'mermaid-heel': 0x4169E1, // Bleu royal
	'crime-sorciere': 0x800080, // Violet
	'exceed': 0x87CEEB, // Bleu ciel
	'dragon': 0xDC143C, // Cramoisi
	'spriggan': 0x2F4F4F, // Gris ardoise
	'default': 0xE8672A,
}

// Mapping personnage → groupe pour les couleurs
const CHARACTER_GROUPS: Record<string, string> = {
	'natsu-dragnir': 'fairy-tail',
	'lucy-heartfilia': 'fairy-tail',
	'grey-fullbuster': 'fairy-tail',
	'erza-scarlett': 'fairy-tail',
	'wendy-marvel': 'fairy-tail',
	'gajil-redfox': 'fairy-tail',
	'luxus-draer': 'fairy-tail',
	'mirajane-strauss': 'fairy-tail',
	'makarof-draer': 'fairy-tail',
	'elfman-strauss': 'fairy-tail',
	'lisana-strauss': 'fairy-tail',
	'gildarts-clive': 'fairy-tail',
	'reby-macgarden': 'fairy-tail',
	'kanna-alperona': 'fairy-tail',
	'fried-justin': 'fairy-tail',
	'bixrow': 'fairy-tail',
	'ever-green': 'fairy-tail',
	'jubia-lokser': 'fairy-tail',
	'panther-lily': 'exceed',
	'carla': 'exceed',
	'gerald-fernandez': 'crime-sorciere',
	'ultia-milkovich': 'crime-sorciere',
	'meldy': 'crime-sorciere',
	'erick': 'crime-sorciere',
	'leon-bastia': 'fairy-tail',
	'leo': 'fairy-tail',
	'mavis-vermillion': 'fairy-tail',
	'zeleph-dragnir': 'villain',
	'acnologia': 'dragon',
	'hades': 'villain',
	'ignir': 'dragon',
	'sting-youclif': 'sabertooth',
	'rog-chenny': 'sabertooth',
	'minerva-orlando': 'sabertooth',
	'kagura-mikazuchi': 'mermaid-heel',
	'silver-fullbuster': 'villain',
	'eileen-belserion': 'spriggan',
	'brandish-myuh': 'spriggan',
	'august': 'spriggan',
	'rahkeid-dragnir': 'spriggan',
	'inbel-yura': 'spriggan',
}

// Ordre d'affichage souhaité
const DISPLAY_ORDER = [
	'natsu-dragnir',
	'lucy-heartfilia',
	'grey-fullbuster',
	'erza-scarlett',
	'wendy-marvel',
	'gajil-redfox',
	'luxus-draer',
	'mirajane-strauss',
	'makarof-draer',
	'elfman-strauss',
	'lisana-strauss',
	'gildarts-clive',
	'jubia-lokser',
	'gerald-fernandez',
	'ultia-milkovich',
	'fried-justin',
	'bixrow',
	'ever-green',
	'reby-macgarden',
	'kanna-alperona',
	'carla',
	'panther-lily',
	'leo',
	'mavis-vermillion',
	'ignir',
	'sting-youclif',
	'rog-chenny',
	'minerva-orlando',
	'kagura-mikazuchi',
	'leon-bastia',
	'erick',
	'meldy',
	'zeleph-dragnir',
	'acnologia',
	'hades',
	'eileen-belserion',
	'brandish-myuh',
	'august',
	'rahkeid-dragnir',
	'inbel-yura',
	'silver-fullbuster',
]

// ─── Types ───────────────────────────────────────────────────────────────────

type InfoboxRow = {
	label: string
	value: string
}

type CharacterPresentation = {
	slug: string
	name: string
	infobox: InfoboxRow[]
	apparence: string
	personnalite: string
	wikiUrl: string
	imageUrl?: string
}

// ─── Parsing des fichiers markdown ───────────────────────────────────────────

function parseIdentityMd(content: string): { name: string, infobox: InfoboxRow[], apparence: string } {
	const lines = content.split('\n')

	// Nom depuis le H1
	const name = lines.find(l => l.startsWith('# '))?.replace('# ', '').trim() ?? 'Inconnu'

	// Parser le tableau markdown
	const infobox: InfoboxRow[] = []
	let inTable = false
	let headerSkipped = false

	for (const line of lines) {
		if (line.startsWith('| Champ')) {
			inTable = true
			continue
		}
		if (inTable && line.startsWith('|---')) {
			headerSkipped = true
			continue
		}
		if (inTable && headerSkipped && line.startsWith('|')) {
			const cells = line.split('|').map(c => c.trim()).filter(Boolean)
			if (cells.length >= 2) {
				const label = cells[0].replace(/\*\*/g, '')
				const value = cells[1]
				// Filtrer les doublons et champs non pertinents
				if (label !== 'Nom' && label !== 'nom' && label !== 'Image' && value) {
					infobox.push({ label, value })
				}
			}
		} else if (inTable && headerSkipped && !line.startsWith('|')) {
			inTable = false
		}
	}

	// Section Apparence
	const apparenceIdx = lines.findIndex(l => l.startsWith('## Apparence'))
	let apparence = ''
	if (apparenceIdx !== -1) {
		const apparenceLines: string[] = []
		for (let i = apparenceIdx + 1; i < lines.length; i++) {
			if (lines[i].startsWith('## ')) break
			apparenceLines.push(lines[i])
		}
		apparence = apparenceLines.join('\n').trim()
	}

	return { name, infobox, apparence }
}

function parsePersonalityMd(content: string): string {
	const lines = content.split('\n')
	// Skip le titre H1
	const startIdx = lines.findIndex(l => l.startsWith('# '))
	const body = lines.slice(startIdx + 1).join('\n').trim()

	return body
}

// ─── Récupération de l'image depuis le wiki ──────────────────────────────────

async function fetchCharacterImage(wikiName: string): Promise<string | undefined> {
	try {
		const encoded = encodeURIComponent(wikiName.replace(/ /g, '_'))
		const url = `${API_URL}?action=query&titles=${encoded}&prop=pageimages&pithumbsize=300&format=json`
		const res = await fetch(url)
		if (!res.ok) return undefined
		const data = await res.json() as any
		const pages = data.query?.pages ?? {}
		const page = Object.values(pages)[0] as any

		return page?.thumbnail?.source
	} catch {
		return undefined
	}
}

// ─── Génération de l'embed Discord ───────────────────────────────────────────

function buildEmbed(char: CharacterPresentation): EmbedBuilder {
	const group = CHARACTER_GROUPS[char.slug] ?? 'default'
	const color = COLORS[group] ?? COLORS.default

	const embed = new EmbedBuilder()
		.setTitle(`⚔️ ${char.name}`)
		.setColor(color)
		.setURL(char.wikiUrl)

	if (char.imageUrl) {
		embed.setThumbnail(char.imageUrl)
	}

	// Infobox : champs clés en fields
	const keyFields = ['Kanji', 'Alias', 'Sexe', 'Âge', 'Magie', 'Affiliation', 'Occupation', 'Équipe']
	const relevantFields = char.infobox.filter(f => keyFields.some(k => f.label.includes(k)))

	for (const field of relevantFields.slice(0, 8)) {
		const value = field.value.length > 1024 ? `${field.value.slice(0, 1021)}...` : field.value
		embed.addFields({ name: field.label, value, inline: true })
	}

	// Personnalité : résumé (premier paragraphe)
	if (char.personnalite) {
		// Prendre les premiers ~600 chars qui forment des phrases complètes
		let summary = char.personnalite
		// Nettoyer les légendes d'images wiki (lignes courtes isolées)
		summary = summary.split('\n').filter(l => l.length > 30 || l === '').join('\n')
		if (summary.length > 600) {
			const cut = summary.lastIndexOf('.', 600)
			summary = `${summary.slice(0, cut > 200 ? cut + 1 : 600)}...`
		}
		if (summary.trim()) {
			embed.addFields({ name: '🧠 Personnalité', value: summary.trim(), inline: false })
		}
	}

	// Apparence : résumé court
	if (char.apparence) {
		let apparence = char.apparence
		apparence = apparence.split('\n').filter(l => l.length > 30 || l === '').join('\n')
		if (apparence.length > 400) {
			const cut = apparence.lastIndexOf('.', 400)
			apparence = `${apparence.slice(0, cut > 150 ? cut + 1 : 400)}...`
		}
		if (apparence.trim()) {
			embed.addFields({ name: '👤 Apparence', value: apparence.trim(), inline: false })
		}
	}

	embed.setFooter({ text: `Fairy Tail Wiki FR • ${char.name}` })

	return embed
}

// ─── Slug → wiki name mapping ────────────────────────────────────────────────

const SLUG_TO_WIKI: Record<string, string> = {
	'natsu-dragnir': 'Natsu Dragnir',
	'lucy-heartfilia': 'Lucy Heartfilia',
	'grey-fullbuster': 'Grey Fullbuster',
	'erza-scarlett': 'Erza Scarlett',
	'wendy-marvel': 'Wendy Marvel',
	'gajil-redfox': 'Gajil Redfox',
	'luxus-draer': 'Luxus Draer',
	'mirajane-strauss': 'Mirajane Strauss',
	'makarof-draer': 'Makarof Draer',
	'gerald-fernandez': 'Gerald Fernandez',
	'jubia-lokser': 'Jubia Lokser',
	'ultia-milkovich': 'Ultia Milkovich',
	'elfman-strauss': 'Elfman Strauss',
	'carla': 'Carla',
	'mavis-vermillion': 'Mavis Vermillion',
	'zeleph-dragnir': 'Zeleph Dragnir',
	'acnologia': 'Acnologia',
	'hades': 'Hades',
	'gildarts-clive': 'Gildarts Clive',
	'lisana-strauss': 'Lisana Strauss',
	'reby-macgarden': 'Reby MacGarden',
	'kanna-alperona': 'Kanna Alperona',
	'fried-justin': 'Fried Justin',
	'bixrow': 'Bixrow',
	'ever-green': 'Ever Green',
	'erick': 'Erick',
	'meldy': 'Meldy',
	'leon-bastia': 'Leon Bastia',
	'leo': 'Léo',
	'ignir': 'Ignir',
	'sting-youclif': 'Sting Youclif',
	'rog-chenny': 'Rog Chenny',
	'minerva-orlando': 'Minerva Orlando',
	'kagura-mikazuchi': 'Kagura Mikazuchi',
	'silver-fullbuster': 'Silver Fullbuster',
	'eileen-belserion': 'Eileen Belserion',
	'brandish-myuh': 'Brandish Myuh',
	'august': 'August',
	'rahkeid-dragnir': 'Rahkeid Dragnir',
	'inbel-yura': 'Inbel Yura',
	'panther-lily': 'Panther Lily',
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
	const args = process.argv.slice(2)
	const limitArg = args.find(a => a.startsWith('--limit='))
	const limit = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : undefined
	const dryRun = args.includes('--dry-run')

	// Lire les dossiers de personnages
	const dirs = fs.readdirSync(CHARACTERS_DIR).filter(d =>
		fs.statSync(path.join(CHARACTERS_DIR, d)).isDirectory()
	)

	// Ordonner selon DISPLAY_ORDER
	const ordered = DISPLAY_ORDER.filter(s => dirs.includes(s))
	// Ajouter ceux pas dans l'ordre explicite
	for (const d of dirs) {
		if (!ordered.includes(d)) ordered.push(d)
	}

	const slugs = limit ? ordered.slice(0, limit) : ordered

	console.log(`📋 ${slugs.length} personnages à présenter${dryRun ? ' (dry-run)' : ''}`)

	// Préparer les données
	const presentations: CharacterPresentation[] = []

	for (const slug of slugs) {
		const charDir = path.join(CHARACTERS_DIR, slug)
		const identityPath = path.join(charDir, 'identity.md')
		const personalityPath = path.join(charDir, 'personality.md')

		if (!fs.existsSync(identityPath)) {
			console.warn(`⚠ ${slug}: identity.md manquant, skip`)
			continue
		}

		const identityContent = fs.readFileSync(identityPath, 'utf-8')
		const { name, infobox, apparence } = parseIdentityMd(identityContent)

		let personnalite = ''
		if (fs.existsSync(personalityPath)) {
			const personalityContent = fs.readFileSync(personalityPath, 'utf-8')
			personnalite = parsePersonalityMd(personalityContent)
		}

		const wikiName = SLUG_TO_WIKI[slug] ?? name
		const wikiUrl = `${WIKI_BASE}/${encodeURIComponent(wikiName.replace(/ /g, '_'))}`

		// Récupérer l'image
		console.log(`  🔍 ${name}...`)
		const imageUrl = await fetchCharacterImage(wikiName)

		presentations.push({ slug, name, infobox, apparence, personnalite, wikiUrl, imageUrl })
	}

	if (dryRun) {
		console.log('\n--- DRY RUN ---')
		for (const p of presentations) {
			const embed = buildEmbed(p)
			console.log(`\n✓ ${p.name} (${p.slug})`)
			console.log(`  Image: ${p.imageUrl ?? 'aucune'}`)
			console.log(`  Infobox: ${p.infobox.length} champs`)
			console.log(`  Personnalité: ${p.personnalite.length} chars`)
			console.log(`  Apparence: ${p.apparence.length} chars`)
			console.log(`  Fields dans embed: ${embed.data.fields?.length ?? 0}`)
		}
		console.log(`\n📊 Total: ${presentations.length} embeds prêts`)

		return
	}

	// Connexion Discord et envoi
	const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	})

	client.once('ready', async () => {
		console.log(`\n🤖 Bot connecté: ${client.user?.tag}`)

		try {
			const channel = await client.channels.fetch(CHANNEL_ID)
			if (!channel || !(channel instanceof TextChannel)) {
				console.error(`❌ Salon ${CHANNEL_ID} introuvable ou pas un TextChannel`)

				return
			}

			console.log(`📢 Envoi dans #${channel.name}...\n`)

			// Message d'introduction
			await channel.send({
				content: [
					'# ⚔️ GALERIE DES MAGES — FAIRY TAIL',
					'',
					'*Bienvenue dans la galerie des personnages ! Vous trouverez ici les fiches de présentation des mages, dragons, démons et autres figures emblématiques de l\'univers Fairy Tail.*',
					'',
					'> *« Même si je ne te vois pas... même si on est séparés... je te regarderai toujours... toujours. »* — Makarof Draer',
				].join('\n'),
			})

			// Envoyer un embed par personnage avec un délai pour éviter le rate limit
			let sent = 0
			for (const p of presentations) {
				const embed = buildEmbed(p)
				await channel.send({ embeds: [embed] })
				sent++
				console.log(`  ✓ ${p.name} (${sent}/${presentations.length})`)

				// Petit délai pour éviter le rate limit Discord
				if (sent % 5 === 0) {
					await new Promise(r => setTimeout(r, 2000))
				} else {
					await new Promise(r => setTimeout(r, 500))
				}
			}

			// Message de fin
			await channel.send({
				content: [
					'---',
					`*${presentations.length} fiches de personnages • Données issues du [Wiki Fairy Tail FR](https://fairy-tail.fandom.com/fr/) • Aye !*`,
				].join('\n'),
			})

			console.log(`\n✅ ${sent} présentations envoyées dans #${channel.name}`)
		} catch (err) {
			console.error('❌ Erreur:', err)
		} finally {
			client.destroy()
			process.exit(0)
		}
	})

	client.login(process.env.BOT_TOKEN)
}

main().catch((err) => {
	console.error('Erreur fatale:', err)
	process.exit(1)
})

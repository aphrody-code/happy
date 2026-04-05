/**
 * Simplifie les noms de salons trop longs pour respecter les conventions Discord.
 * Usage: node scripts/simplify-names.mjs [--dry-run]
 */
import 'dotenv/config'

const TOKEN = process.env.BOT_TOKEN
const GUILD_ID = process.env.TEST_GUILD_ID
const API = `https://discord.com/api/v10`
const headers = {
	'Authorization': `Bot ${TOKEN}`,
	'Content-Type': 'application/json',
}
const DRY_RUN = process.argv.includes('--dry-run')

async function apiCall(method, path, body) {
	if (DRY_RUN && method !== 'GET') {
		console.log(`  [DRY] ${method} ${path} → ${JSON.stringify(body)}`)

		return {}
	}
	const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
	if (!res.ok) {
		console.error(`  ❌ ${method} ${path} → ${res.status}: ${await res.text()}`)

		return null
	}
	const remaining = res.headers.get('x-ratelimit-remaining')
	if (remaining === '0') {
		const wait = Number.parseFloat(res.headers.get('x-ratelimit-reset-after') || '1')
		console.log(`  ⏳ Rate limit ${wait.toFixed(1)}s...`)
		await new Promise(r => setTimeout(r, wait * 1000 + 300))
	}

	return res.status === 204 ? {} : res.json()
}

// Renommages : noms longs → noms courts (1-2 mots)
const RENAMES = {
	// TABLEAU D'AFFICHAGE
	'📜・code-des-mages': '📜・règlement',
	'📢・avis-du-maître': '📢・annonces',
	'📖・galerie-des-mages': '📖・personnages',
	'📰・actualités-de-fiore': '📰・actualités',

	// TAVERNE DE LA GUILDE
	'🚪・porte-de-la-guilde': '🚪・bienvenue',
	'💡・boîte-à-requêtes': '💡・suggestions',
	'🔮・lacrima-bot': '🔮・lacrima',

	// FAIRY TAIL
	'😂・memes-de-la-guilde': '😂・memes',
	'⚔️・combats-légendaires': '⚔️・combats',
	'🏆・panthéon-des-mages': '🏆・panthéon',
	'✨・magies-et-pouvoirs': '✨・magies',

	// MISSIONS & QUÊTES
	'⚔️・tableau-des-missions': '⚔️・missions',
	'🏪・marché-de-magnolia': '🏪・boutique',
	'🏆・rang-des-mages': '🏆・classement',
	'🎲・jeux-magiques': '🎲・mini-jeux',
	'📋・quêtes-en-cours': '📋・quêtes',
	'📜・règles-des-missions': '📜・règles-rpg',
	'🏅・classement-des-guildes': '🏅・guildes',
	'💬・parloir-des-guildes': '💬・parloir',
	'🏰・hall-de-fairy-tail': '🏰・fairy-tail',
	'🌳・parc-de-magnolia': '🌳・parc',
	'🚂・gare-de-magnolia': '🚂・gare',

	// HORS DE FIORE
	'🎮・arène-de-jeux': '🎮・gaming',
	'📺・autres-séries': '📺・séries',
	'🔞・zone-interdite': '🔞・nsfw',

	// CONSEIL DES MAGES
	'💬・salle-du-conseil': '💬・conseil',

	// BUREAU DU MAÎTRE
	'📊・lacrima-stats': '📊・stats',
	'🧪・laboratoire': '🧪・test-bot',
}

async function main() {
	console.log(`${DRY_RUN ? '🧪 DRY-RUN — ' : ''}Simplification des noms de salons`)
	console.log('─'.repeat(45))

	const channels = await apiCall('GET', `/guilds/${GUILD_ID}/channels`)
	if (!channels) process.exit(1)

	let count = 0
	for (const ch of channels) {
		const newName = RENAMES[ch.name]
		if (newName) {
			const result = await apiCall('PATCH', `/channels/${ch.id}`, { name: newName })
			if (result) {
				console.log(`  ${ch.name} → ${newName}`)
				count++
			}
			if (count % 8 === 0 && count > 0) {
				await new Promise(r => setTimeout(r, 3000))
			}
		}
	}

	console.log(`\n✅ ${count} salon(s) renommé(s)`)
}

main().catch(console.error)

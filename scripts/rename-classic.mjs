/**
 * Renomme les salons et catégories vers des noms Discord classiques.
 * Usage: node --env-file=.env scripts/rename-classic.mjs [--dry-run]
 */

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
	const res = await fetch(`${API}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	})
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

// ── Renommages ──

const CATEGORY_RENAMES = {
	'📜 TABLEAU D\'AFFICHAGE': '📌 INFORMATIONS',
	'🌍 HORS DE FIORE': '☕ HORS-SUJET',
	'🔊 SALLES DE LA GUILDE': '🔊 VOCAL',
	'🎫 REQUÊTES': '🎫 TICKETS',
	'⚖️ CONSEIL DES MAGES': '🔒 STAFF',
}

const CHANNEL_RENAMES = {
	// INFORMATIONS
	'📜・règlement': '📜・règles',
	'📖・-présentations': '📖・personnages',
	'📰・actualités': '📰・actus',
	'⚔️・choisir-sa-guilde': '⚔️・guildes',

	// FAIRY TAIL
	'🚪・bienvenue': '👋・bienvenue',
	'🍺・comptoir': '💬・général',
	'✍️・marquage': '✍️・présentations',
	'🤖・bot': '🤖・commandes',
	'🐛・signalements': '🐛・bugs',
	'📺・anime-manga': '📺・anime',
	'🔮・prophéties': '🔮・théories',
	'⚔️・combats': '⚔️・débats',
	'🏆・panthéon': '🏆・tier-list',
	'✨・magies': '✨・pouvoirs',

	// HORS-SUJET
	'☕・détente': '💬・blabla',

	// VOCAL
	'🔊・Hall de la Guilde': '🔊・Général',
	'🍺・Bar de la Guilde': '☕・Chill',
	'🏰・Salle du Conseil': '🔒・Staff',
	'🎵・Salle de Lyra': '🎵・Musique',
	'📺・Lacrima-Vision': '📺・Cinéma',
	'🎮・Arène': '🎮・Gaming',
	'📚・Bibliothèque': '📚・Étude',

	// STAFF
	'💬・conseil': '💬・discussion',
	'⚖️・jugements': '⚖️・sanctions',
	'📝・archives': '📝・logs',
	'🔧・bureau': '🔧・config',
}

async function main() {
	console.log(`${DRY_RUN ? '🧪 DRY-RUN — ' : ''}Renommage classique Discord`)
	console.log('─'.repeat(50))

	const channels = await apiCall('GET', `/guilds/${GUILD_ID}/channels`)
	if (!channels) process.exit(1)

	// Rename categories
	console.log('\n📁 Catégories...')
	let catCount = 0
	for (const ch of channels) {
		const newName = CATEGORY_RENAMES[ch.name]
		if (newName) {
			const result = await apiCall('PATCH', `/channels/${ch.id}`, { name: newName })
			if (result) {
				console.log(`  ${ch.name} → ${newName}`)
				catCount++
			}
		}
	}

	// Rename channels
	console.log('\n💬 Salons...')
	let chCount = 0
	for (const ch of channels) {
		const newName = CHANNEL_RENAMES[ch.name]
		if (newName) {
			const result = await apiCall('PATCH', `/channels/${ch.id}`, { name: newName })
			if (result) {
				console.log(`  ${ch.name} → ${newName}`)
				chCount++
			}
			if (chCount % 8 === 0 && chCount > 0) {
				await new Promise(r => setTimeout(r, 3000))
			}
		}
	}

	console.log(`\n✅ ${catCount} catégorie(s) + ${chCount} salon(s) renommé(s)`)
}

main().catch(console.error)

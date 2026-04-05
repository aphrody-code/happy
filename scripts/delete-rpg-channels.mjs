/**
 * Supprime tous les salons RPG, la catégorie MISSIONS & QUÊTES,
 * et le doublon 📸・-médias.
 *
 * Usage: node --env-file=.env scripts/delete-rpg-channels.mjs [--dry-run]
 */

const TOKEN = process.env.BOT_TOKEN
const GUILD_ID = process.env.TEST_GUILD_ID
const API = `https://discord.com/api/v10`
const headers = {
	'Authorization': `Bot ${TOKEN}`,
	'Content-Type': 'application/json',
}
const DRY_RUN = process.argv.includes('--dry-run')

async function apiCall(method, path) {
	if (DRY_RUN && method !== 'GET') {
		console.log(`  [DRY] ${method} ${path}`)
		return {}
	}
	const res = await fetch(`${API}${path}`, { method, headers })
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

async function main() {
	console.log(`${DRY_RUN ? '🧪 DRY-RUN — ' : ''}Suppression RPG + doublons`)
	console.log('─'.repeat(50))

	const channels = await apiCall('GET', `/guilds/${GUILD_ID}/channels`)
	if (!channels) process.exit(1)

	// 1. Delete all channels in MISSIONS & QUÊTES
	const rpgCat = channels.find(c => c.type === 4 && c.name === '⚔️ MISSIONS & QUÊTES')
	if (rpgCat) {
		const rpgChannels = channels.filter(c => c.parent_id === rpgCat.id)
		console.log(`\n🗑️  Suppression de ${rpgChannels.length} salons RPG...`)
		let count = 0
		for (const ch of rpgChannels) {
			const result = await apiCall('DELETE', `/channels/${ch.id}`)
			if (result !== null) {
				console.log(`  ✓ ${ch.name}`)
				count++
			}
			if (count % 5 === 0 && count > 0) {
				await new Promise(r => setTimeout(r, 2000))
			}
		}
		// Delete the category itself
		console.log(`\n🗑️  Suppression de la catégorie...`)
		await apiCall('DELETE', `/channels/${rpgCat.id}`)
		console.log(`  ✓ ${rpgCat.name}`)
	} else {
		console.log('⚠️  Catégorie MISSIONS & QUÊTES introuvable')
	}

	// 2. Delete doublon 📸・-médias
	const medias = channels.find(c => c.name === '📸・-médias')
	if (medias) {
		console.log(`\n🗑️  Suppression du doublon...`)
		await apiCall('DELETE', `/channels/${medias.id}`)
		console.log(`  ✓ 📸・-médias`)
	}

	console.log('\n✅ Nettoyage terminé !')
}

main().catch(console.error)

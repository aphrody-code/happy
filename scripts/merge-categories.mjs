/**
 * Fusionne les catégories :
 *   TAVERNE DE LA GUILDE → FAIRY TAIL
 *   BUREAU DU MAÎTRE → CONSEIL DES MAGES
 *
 * Usage: node --env-file=.env scripts/merge-categories.mjs [--dry-run]
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

async function main() {
	console.log(`${DRY_RUN ? '🧪 DRY-RUN — ' : ''}Fusion des catégories`)
	console.log('─'.repeat(50))

	const channels = await apiCall('GET', `/guilds/${GUILD_ID}/channels`)
	if (!channels) process.exit(1)

	const findCat = name => channels.find(c => c.type === 4 && c.name === name)
	const childrenOf = catId => channels.filter(c => c.parent_id === catId).sort((a, b) => a.position - b.position)

	// ─── 1. TAVERNE → FAIRY TAIL ───
	console.log('\n📦 Fusion : TAVERNE DE LA GUILDE → FAIRY TAIL')

	const taverne = findCat('🍺 TAVERNE DE LA GUILDE')
	const fairyTail = findCat('🧚 FAIRY TAIL')

	if (!taverne || !fairyTail) {
		console.error('❌ Catégorie TAVERNE ou FAIRY TAIL introuvable')
		process.exit(1)
	}

	const taverneChannels = childrenOf(taverne.id)
	console.log(`  Déplacement de ${taverneChannels.length} salons...`)

	// Get current FT channel count to position taverne channels at the top
	const ftChannels = childrenOf(fairyTail.id)
	let pos = 0

	for (const ch of taverneChannels) {
		const result = await apiCall('PATCH', `/channels/${ch.id}`, {
			parent_id: fairyTail.id,
			position: pos++,
		})
		if (result) console.log(`  ✓ ${ch.name} → 🧚 FAIRY TAIL`)
	}

	// Delete empty TAVERNE category
	console.log(`  Suppression de la catégorie TAVERNE (${taverne.id})...`)
	await apiCall('DELETE', `/channels/${taverne.id}`)
	console.log('  ✓ Catégorie supprimée')

	// ─── 2. BUREAU DU MAÎTRE → CONSEIL DES MAGES ───
	console.log('\n📦 Fusion : BUREAU DU MAÎTRE → CONSEIL DES MAGES')

	const bureau = findCat('👑 BUREAU DU MAÎTRE')
	const conseil = findCat('⚖️ CONSEIL DES MAGES')

	if (!bureau || !conseil) {
		console.error('❌ Catégorie BUREAU ou CONSEIL introuvable')
		process.exit(1)
	}

	const bureauChannels = childrenOf(bureau.id)
	console.log(`  Déplacement de ${bureauChannels.length} salons...`)

	// Get the guild roles to find admin role ID
	const roles = await apiCall('GET', `/guilds/${GUILD_ID}/roles`)
	const adminRole = roles.find(r => r.name === '👑 Maître de Guilde')
	const everyoneRole = roles.find(r => r.name === '@everyone')

	for (const ch of bureauChannels) {
		// Keep admin-only permission overrides on each channel
		const overrides = []
		if (everyoneRole) {
			overrides.push({
				id: everyoneRole.id,
				type: 0, // Role
				deny: String(1 << 10), // ViewChannel
			})
		}
		if (adminRole) {
			overrides.push({
				id: adminRole.id,
				type: 0, // Role
				allow: String((1 << 10) | (1 << 11) | (1 << 13)), // ViewChannel | SendMessages | ManageMessages
			})
		}

		const result = await apiCall('PATCH', `/channels/${ch.id}`, {
			parent_id: conseil.id,
			permission_overwrites: overrides,
		})
		if (result) console.log(`  ✓ ${ch.name} → ⚖️ CONSEIL DES MAGES (admin-only)`)
	}

	// Delete empty BUREAU category
	console.log(`  Suppression de la catégorie BUREAU (${bureau.id})...`)
	await apiCall('DELETE', `/channels/${bureau.id}`)
	console.log('  ✓ Catégorie supprimée')

	console.log('\n✅ Fusion terminée !')
}

main().catch(console.error)

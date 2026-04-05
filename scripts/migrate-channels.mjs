/**
 * Script de migration : réorganise tous les salons dans les bonnes catégories.
 * Fusionne les anciennes catégories redondantes et supprime les vides.
 *
 * Usage: node scripts/migrate-channels.mjs
 */
import 'dotenv/config'

const TOKEN = process.env.BOT_TOKEN
const GUILD_ID = process.env.TEST_GUILD_ID
const API = `https://discord.com/api/v10`
const headers = {
	'Authorization': `Bot ${TOKEN}`,
	'Content-Type': 'application/json',
}

async function apiCall(method, path, body) {
	const res = await fetch(`${API}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	})
	if (!res.ok) {
		const text = await res.text()
		console.error(`  ❌ ${method} ${path} → ${res.status}: ${text}`)

		return null
	}
	const remaining = res.headers.get('x-ratelimit-remaining')
	if (remaining === '0') {
		const resetAfter = Number.parseFloat(res.headers.get('x-ratelimit-reset-after') || '1')
		console.log(`  ⏳ Rate limit, pause ${resetAfter.toFixed(1)}s...`)
		await new Promise(r => setTimeout(r, resetAfter * 1000 + 200))
	}
	if (res.status === 204) return {}

	return res.json()
}

async function moveChannel(channelId, channelName, targetCategoryId, targetCategoryName) {
	const result = await apiCall('PATCH', `/channels/${channelId}`, { parent_id: targetCategoryId })
	if (result) {
		console.log(`  ↪️  ${channelName} → ${targetCategoryName}`)
	}

	return result
}

async function deleteChannel(channelId, channelName) {
	const result = await apiCall('DELETE', `/channels/${channelId}`)
	if (result) {
		console.log(`  🗑️  Supprimé : ${channelName}`)
	}

	return result
}

async function main() {
	console.log('🔄 Migration des salons du serveur Fairy Tail FR')
	console.log('═'.repeat(50))

	const channels = await apiCall('GET', `/guilds/${GUILD_ID}/channels`)
	if (!channels) process.exit(1)

	const cats = {}
	const chans = {}
	for (const c of channels) {
		if (c.type === 4) cats[c.name] = c
		else {
			if (!chans[c.parent_id]) chans[c.parent_id] = []
			chans[c.parent_id].push(c)
		}
	}

	const find = name => channels.find(c => c.name === name)
	const findInCat = (catId, name) => (chans[catId] || []).find(c => c.name === name)

	// ── Catégories cibles ──
	const CAT_GENERAL = cats['💬 GÉNÉRAL']
	const CAT_FT = cats['🧚 FAIRY TAIL']
	const CAT_RPG = cats['⚔️ RPG & JEUX']
	const CAT_HS = cats['🌍 HORS-SUJET']
	const CAT_VOCAUX = cats['🔊 VOCAUX']
	const CAT_CONSEIL = cats['⚖️ CONSEIL DES MAGES']
	const CAT_ADMIN = cats['👑 ADMINISTRATION']

	if (!CAT_GENERAL || !CAT_FT || !CAT_RPG || !CAT_HS || !CAT_VOCAUX) {
		console.error('❌ Catégories cibles manquantes. Exécutez d\'abord setup-server.mjs.')
		process.exit(1)
	}

	// ══════════════════════════════════════════
	// 1. 🍺 BAR DE LA GUILDE → fusionner
	// ══════════════════════════════════════════
	const catBar = cats['🍺 BAR DE LA GUILDE']
	if (catBar) {
		console.log('\n🍺 BAR DE LA GUILDE → fusion')
		const barChannels = chans[catBar.id] || []
		for (const ch of barChannels) {
			if (ch.name.includes('memes') || ch.name.includes('cosplay')) {
				await moveChannel(ch.id, ch.name, CAT_FT.id, '🧚 FAIRY TAIL')
			} else {
				await moveChannel(ch.id, ch.name, CAT_HS.id, '🌍 HORS-SUJET')
			}
		}
		await deleteChannel(catBar.id, '🍺 BAR DE LA GUILDE')
	}

	// ══════════════════════════════════════════
	// 2. 🤖 BOTS → fusionner dans GÉNÉRAL
	// ══════════════════════════════════════════
	const catBots = cats['🤖 BOTS']
	if (catBots) {
		console.log('\n🤖 BOTS → fusion')
		const botChannels = chans[catBots.id] || []
		for (const ch of botChannels) {
			if (ch.name.includes('musique-bot')) {
				await moveChannel(ch.id, ch.name, CAT_GENERAL.id, '💬 GÉNÉRAL')
			} else if (ch.name.includes('commandes')) {
				// Doublon avec 🤖・commandes-bot → supprimer l'ancien
				const newCmdBot = findInCat(CAT_GENERAL.id, '🤖・commandes-bot')
				if (newCmdBot) {
					await deleteChannel(ch.id, `${ch.name} (doublon)`)
				} else {
					await moveChannel(ch.id, ch.name, CAT_GENERAL.id, '💬 GÉNÉRAL')
				}
			} else {
				await moveChannel(ch.id, ch.name, CAT_GENERAL.id, '💬 GÉNÉRAL')
			}
		}
		await deleteChannel(catBots.id, '🤖 BOTS')
	}

	// ══════════════════════════════════════════
	// 3. 🎮 DIVERTISSEMENT → fusionner dans HORS-SUJET
	// ══════════════════════════════════════════
	const catDiv = cats['🎮 DIVERTISSEMENT']
	if (catDiv) {
		console.log('\n🎮 DIVERTISSEMENT → fusion dans HORS-SUJET')
		const divChannels = chans[catDiv.id] || []
		for (const ch of divChannels) {
			await moveChannel(ch.id, ch.name, CAT_HS.id, '🌍 HORS-SUJET')
		}
		await deleteChannel(catDiv.id, '🎮 DIVERTISSEMENT')
	}

	// ══════════════════════════════════════════
	// 4. 🔊 VOCAL (ancien) → fusionner dans 🔊 VOCAUX
	// ══════════════════════════════════════════
	const catVocalOld = cats['🔊 VOCAL']
	if (catVocalOld) {
		console.log('\n🔊 VOCAL → fusion dans VOCAUX')
		const vocalChannels = chans[catVocalOld.id] || []
		for (const ch of vocalChannels) {
			// Les text channels dans un vocal (comme 🎤❌) → GÉNÉRAL
			if (ch.type === 0) {
				await moveChannel(ch.id, ch.name, CAT_GENERAL.id, '💬 GÉNÉRAL')
			} else {
				// Vérifier s'il y a un doublon dans VOCAUX
				const existing = findInCat(CAT_VOCAUX.id, ch.name)
				if (existing) {
					console.log(`  ⏭️  ${ch.name} (doublon, gardé dans VOCAUX)`)
					await deleteChannel(ch.id, `${ch.name} (doublon)`)
				} else {
					await moveChannel(ch.id, ch.name, CAT_VOCAUX.id, '🔊 VOCAUX')
				}
			}
		}
		await deleteChannel(catVocalOld.id, '🔊 VOCAL')
	}

	// ══════════════════════════════════════════
	// 5. 🏰 GUILDES → fusionner dans RPG & JEUX
	// ══════════════════════════════════════════
	const catGuildes = cats['🏰 GUILDES']
	if (catGuildes) {
		console.log('\n🏰 GUILDES → fusion dans RPG & JEUX')
		const guildeChannels = chans[catGuildes.id] || []
		for (const ch of guildeChannels) {
			await moveChannel(ch.id, ch.name, CAT_RPG.id, '⚔️ RPG & JEUX')
		}
		await deleteChannel(catGuildes.id, '🏰 GUILDES')
	}

	// ══════════════════════════════════════════
	// 6. 🎲 RPG FAIRY TAIL → fusionner dans RPG & JEUX
	// ══════════════════════════════════════════
	const catRPGold = cats['🎲 RPG FAIRY TAIL']
	if (catRPGold) {
		console.log('\n🎲 RPG FAIRY TAIL → fusion dans RPG & JEUX')
		const rpgChannels = chans[catRPGold.id] || []
		for (const ch of rpgChannels) {
			// Vérifier les doublons
			const cleanName = ch.name.replace(/[^\w-]/g, '').toLowerCase()
			const existingInRPG = (chans[CAT_RPG.id] || []).find(c =>
				c.name.replace(/[^\w-]/g, '').toLowerCase() === cleanName
			)
			if (existingInRPG) {
				await deleteChannel(ch.id, `${ch.name} (doublon)`)
			} else {
				await moveChannel(ch.id, ch.name, CAT_RPG.id, '⚔️ RPG & JEUX')
			}
		}
		await deleteChannel(catRPGold.id, '🎲 RPG FAIRY TAIL')
	}

	// ══════════════════════════════════════════
	// 7. Nettoyage doublons dans 🧚 FAIRY TAIL
	// ══════════════════════════════════════════
	console.log('\n🧚 FAIRY TAIL → nettoyage doublons')
	const ftChannels = chans[CAT_FT.id] || []

	// Si on a 📺・anime-manga ET (📺・anime OU 📖・manga) → supprimer les anciens
	const animeManga = ftChannels.find(c => c.name === '📺・anime-manga')
	if (animeManga) {
		const oldAnime = ftChannels.find(c => c.name === '📺・anime')
		const oldManga = ftChannels.find(c => c.name === '📖・manga')
		if (oldAnime) await deleteChannel(oldAnime.id, '📺・anime (remplacé par anime-manga)')
		if (oldManga) await deleteChannel(oldManga.id, '📖・manga (remplacé par anime-manga)')
	}

	// Si on a 🔮・théories (nouveau) et 💭・théories (ancien) → supprimer l'ancien
	// En fait le nouveau n'a pas été créé car l'ancien matchait. Pas de doublon.

	// ══════════════════════════════════════════
	// 8. Nettoyage des text channels dans VOCAUX
	// ══════════════════════════════════════════
	console.log('\n🔊 VOCAUX → nettoyage text channels')
	const refreshed = await apiCall('GET', `/guilds/${GUILD_ID}/channels`)
	const vocauxChannels = refreshed.filter(c => c.parent_id === CAT_VOCAUX.id)
	for (const ch of vocauxChannels) {
		if (ch.type === 0) { // text channel dans une catégorie vocale
			if (ch.name.includes('musique') || ch.name.includes('gaming')) {
				await moveChannel(ch.id, ch.name, CAT_HS.id, '🌍 HORS-SUJET')
			}
		}
	}

	// ══════════════════════════════════════════
	// Résumé final
	// ══════════════════════════════════════════
	console.log(`\n${'═'.repeat(50)}`)
	const final = await apiCall('GET', `/guilds/${GUILD_ID}/channels`)
	const finalCats = final.filter(c => c.type === 4).sort((a, b) => a.position - b.position)

	console.log('\n📊 Structure finale du serveur :\n')
	for (const cat of finalCats) {
		const children = final.filter(c => c.parent_id === cat.id).sort((a, b) => a.position - b.position)
		const icon = children.length === 0 ? '📂' : '📁'
		console.log(`${icon} ${cat.name} (${children.length} salons)`)
		for (const ch of children) {
			const t = ch.type === 2 ? '🔊' : '💬'
			console.log(`   ${t} ${ch.name}`)
		}
	}

	const orphans = final.filter(c => c.type !== 4 && !c.parent_id)
	if (orphans.length) {
		console.log(`\n⚠️ ${orphans.length} salon(s) sans catégorie`)
	}

	console.log('\n✅ Migration terminée !')
}

main().catch(console.error)

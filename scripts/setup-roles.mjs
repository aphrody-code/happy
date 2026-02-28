/**
 * Script pour créer tous les rôles Discord du serveur Fairy Tail FR.
 * - Rôles de guildes (38 guildes)
 * - Rôles de genre
 * - Rôles d'accès (Rewatch, Spoilers, NSFW)
 * - Rôles de modération (Conseil des Mages, Admin)
 * - Rôles de couleur / rang
 *
 * Usage: node scripts/setup-roles.mjs
 */
import 'dotenv/config'

const TOKEN = process.env.BOT_TOKEN
const GUILD_ID = process.env.TEST_GUILD_ID
const API = `https://discord.com/api/v10`
const headers = {
	'Authorization': `Bot ${TOKEN}`,
	'Content-Type': 'application/json',
}

// ── API helpers ──

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

	return res.json()
}

async function getGuildRoles() {
	return apiCall('GET', `/guilds/${GUILD_ID}/roles`)
}

async function createRole(data) {
	return apiCall('POST', `/guilds/${GUILD_ID}/roles`, data)
}

async function getGuildChannels() {
	return apiCall('GET', `/guilds/${GUILD_ID}/channels`)
}

async function editChannelPermissions(channelId, overwriteId, data) {
	const res = await fetch(`${API}/channels/${channelId}/permissions/${overwriteId}`, {
		method: 'PUT',
		headers,
		body: JSON.stringify(data),
	})
	if (!res.ok) {
		const text = await res.text()
		console.error(`  ❌ PUT permissions ${channelId}/${overwriteId} → ${res.status}: ${text}`)
	}
	const remaining = res.headers.get('x-ratelimit-remaining')
	if (remaining === '0') {
		const resetAfter = Number.parseFloat(res.headers.get('x-ratelimit-reset-after') || '1')
		await new Promise(r => setTimeout(r, resetAfter * 1000 + 200))
	}
}

// ── Hex to Discord int color ──
function hexToInt(hex) {
	return Number.parseInt(hex.replace('#', ''), 16)
}

// Permission bits
const VIEW_CHANNEL = 1n << 10n
const SEND_MESSAGES = 1n << 11n
const CONNECT = 1n << 20n
const SPEAK = 1n << 21n

// ── Définition de TOUS les rôles ──

const GUILD_ROLES = [
	// Guildes Légales
	{ id: 'fairy-tail', name: 'Fairy Tail', color: '#E8672A', emoji: '🧚' },
	{ id: 'blue-pegasus', name: 'Blue Pegasus', color: '#5B8DEF', emoji: '🦄' },
	{ id: 'lamia-scale', name: 'Lamia Scale', color: '#2ECC71', emoji: '🐍' },
	{ id: 'saber-tooth', name: 'Saber Tooth', color: '#F1C40F', emoji: '🐯' },
	{ id: 'mermaid-heel', name: 'Mermaid Heel', color: '#E91E63', emoji: '🧜' },
	{ id: 'quattro-cerberos', name: 'Quattro Cerberos', color: '#8B4513', emoji: '🐕' },
	{ id: 'twilight-ogre', name: 'Twilight Ogre', color: '#9B59B6', emoji: '👹' },
	{ id: 'carbuncle', name: 'Carbuncle', color: '#E74C3C', emoji: '💎' },
	{ id: 'diabolos', name: 'Diabolos', color: '#C0392B', emoji: '😈' },
	{ id: 'dullahan-head', name: 'Dullahan Head', color: '#7F8C8D', emoji: '💀' },
	{ id: 'dwarf-gear', name: 'Dwarf Gear', color: '#95A5A6', emoji: '⚙️' },
	{ id: 'fairy-nail', name: 'Fairy Nail', color: '#FF69B4', emoji: '💅' },
	{ id: 'fairy-tail-edolas', name: 'Fairy Tail (Edolas)', color: '#E67E22', emoji: '✨' },
	{ id: 'gold-owl', name: 'Gold Owl', color: '#DAA520', emoji: '🦉' },
	{ id: 'gramlush', name: 'Gramlush', color: '#27AE60', emoji: '🌿' },
	{ id: 'hound-holy', name: 'Hound Holy', color: '#3498DB', emoji: '🐺' },
	{ id: 'magia-dragon', name: 'Magia Dragon', color: '#E74C3C', emoji: '🐉' },
	{ id: 'loup-du-sud', name: 'Mercenaires du Loup du Sud', color: '#607D8B', emoji: '🐺' },
	{ id: 'orochis-fin', name: 'Orochi\'s Fin', color: '#1ABC9C', emoji: '🐲' },
	{ id: 'phoenix-grave', name: 'Phoenix Grave', color: '#FF4500', emoji: '🔥' },
	{ id: 'red-princess', name: 'Red Princess', color: '#DC143C', emoji: '👸' },
	{ id: 'scarmiglione', name: 'Scarmiglione', color: '#4A235A', emoji: '🎭' },
	{ id: 'titan-nose', name: 'Titan Nose', color: '#BDC3C7', emoji: '👃' },
	{ id: 'love-lucky', name: 'Love & Lucky', color: '#FF1493', emoji: '💕' },
	// Guildes Noires
	{ id: 'grimoire-heart', name: 'Grimoire Heart', color: '#8B0000', emoji: '📖' },
	{ id: 'tartaros', name: 'Tartaros', color: '#4A0E0E', emoji: '👿' },
	{ id: 'abyss-horn', name: 'Abyss Horn', color: '#2C3E50', emoji: '📯' },
	{ id: 'blue-skull', name: 'Blue Skull', color: '#1A5276', emoji: '☠️' },
	{ id: 'chrono-noise', name: 'Chrono Noise', color: '#6C3483', emoji: '⏰' },
	{ id: 'assassins-skulls', name: 'Assassins des Skulls', color: '#1C1C1C', emoji: '🗡️' },
	{ id: 'dark-mirror', name: 'Dark Mirror', color: '#34495E', emoji: '🪞' },
	{ id: 'fire-flame', name: 'Fire & Flame', color: '#D35400', emoji: '🔥' },
	{ id: 'five-bridge-familia', name: 'Five Bridge Familia', color: '#784212', emoji: '🌉' },
	{ id: 'ghoul-spirits', name: 'Ghoul Spirits', color: '#515A5A', emoji: '👻' },
	{ id: 'naked-mummy', name: 'Naked Mummy', color: '#A04000', emoji: '🩹' },
	{ id: 'raven-goblin', name: 'Raven Goblin', color: '#1B2631', emoji: '🐦‍⬛' },
	{ id: 'succubus-eye', name: 'Succubus Eye', color: '#8E44AD', emoji: '👁️' },
	// Indépendante
	{ id: 'crime-sorciere', name: 'Crime Sorcière', color: '#2980B9', emoji: '⚖️' },
]

const GENRE_ROLES = [
	{ name: 'Homme', color: '#3498DB', emoji: '♂️' },
	{ name: 'Femme', color: '#E91E63', emoji: '♀️' },
	{ name: 'Non-binaire', color: '#9B59B6', emoji: '⚧️' },
	{ name: 'Ne se prononce pas', color: '#95A5A6', emoji: '🤫' },
]

const ACCESS_ROLES = [
	{ name: '📺 Rewatch', color: '#E67E22', reason: 'Accès au salon vocal Rewatch et discussions rewatch' },
	{ name: '⚠️ Spoilers', color: '#E74C3C', reason: 'Accès au salon spoilers' },
	{ name: '🔞 NSFW', color: '#1C1C1C', reason: 'Accès aux salons NSFW (si activés)' },
	{ name: '🎮 Gamer', color: '#2ECC71', reason: 'Accès aux salons gaming et recherche de partenaires' },
	{ name: '🎵 DJ', color: '#9B59B6', reason: 'Accès aux commandes du bot musique' },
	{ name: '📢 Notifications', color: '#F39C12', reason: 'Mentionné pour les annonces importantes' },
]

const MODERATION_ROLES = [
	{ name: '👑 Maître de Guilde', color: '#FFD700', hoist: true, position: 'top', reason: 'Propriétaire/Admin principal du serveur' },
	{ name: '⚖️ Conseil des Mages', color: '#E74C3C', hoist: true, position: 'high', reason: 'Modérateurs du serveur' },
	{ name: '🛡️ Chevalier Runique', color: '#3498DB', hoist: true, position: 'mid', reason: 'Modérateurs juniors / helpers' },
	{ name: '⭐ Mage de Rang S', color: '#F1C40F', hoist: true, position: 'mid', reason: 'Membres VIP / contributeurs importants' },
	{ name: '🤖 Bot', color: '#7289DA', hoist: true, position: 'high', reason: 'Rôle pour les bots du serveur' },
]

const SEPARATOR_ROLES = [
	{ name: '──── GENRE ────', color: '#2F3136' },
	{ name: '──── GUILDE ────', color: '#2F3136' },
	{ name: '──── ACCÈS ────', color: '#2F3136' },
]

// ── Main ──

async function main() {
	console.log('🚀 Création de tous les rôles du serveur...\n')

	const existingRoles = await getGuildRoles()
	if (!existingRoles) {
		console.error('Impossible de récupérer les rôles'); process.exit(1)
	}
	console.log(`📋 ${existingRoles.length} rôles existants\n`)

	const existingNames = new Set(existingRoles.map(r => r.name))
	const createdRoles = {}
	let created = 0
	let skipped = 0

	async function ensureRole(name, color, options = {}) {
		if (existingNames.has(name)) {
			const existing = existingRoles.find(r => r.name === name)
			createdRoles[name] = existing
			skipped++

			return existing
		}

		const role = await createRole({
			name,
			color: hexToInt(color),
			hoist: options.hoist || false,
			mentionable: options.mentionable || false,
			permissions: options.permissions || '0',
		})

		if (role) {
			createdRoles[name] = role
			existingNames.add(name)
			created++
			console.log(`  ✅ ${name}`)
		}

		return role
	}

	// ── 1. Rôles de modération (en premier = plus hauts dans la hiérarchie) ──
	console.log('👑 RÔLES DE MODÉRATION')
	for (const r of MODERATION_ROLES) {
		await ensureRole(r.name, r.color, { hoist: r.hoist })
	}

	// ── 2. Séparateur GENRE ──
	console.log('\n──── SÉPARATEURS ────')
	for (const r of SEPARATOR_ROLES) {
		await ensureRole(r.name, r.color)
	}

	// ── 3. Rôles de genre ──
	console.log('\n♀️ RÔLES DE GENRE')
	for (const r of GENRE_ROLES) {
		await ensureRole(`${r.emoji} ${r.name}`, r.color, { mentionable: false })
	}

	// ── 4. Rôles d'accès ──
	console.log('\n🔑 RÔLES D\'ACCÈS')
	for (const r of ACCESS_ROLES) {
		await ensureRole(r.name, r.color, { mentionable: false })
	}

	// ── 5. Rôles de guildes ──
	console.log('\n🏰 RÔLES DE GUILDES')
	for (const g of GUILD_ROLES) {
		await ensureRole(`Guilde ${g.name}`, g.color, { mentionable: true })
	}

	console.log(`\n━━━━━━━━━━ Rôles terminés ! ━━━━━━━━━━`)
	console.log(`✅ ${created} rôles créés`)
	console.log(`⏭️  ${skipped} rôles ignorés (déjà existants)`)

	// ── 6. Configuration des permissions des salons ──
	console.log('\n🔐 CONFIGURATION DES PERMISSIONS DES SALONS\n')

	const channels = await getGuildChannels()
	if (!channels) {
		console.error('Impossible de récupérer les salons')

		return
	}

	// Trouver les salons par nom
	const findChannel = name => channels.find(c => c.name === name)
	const findCategory = name => channels.find(c => c.type === 4 && c.name === name)

	// ── Rewatch : seuls les membres avec le rôle 📺 Rewatch peuvent rejoindre ──
	const rewatchChannel = findChannel('📺 Rewatch')
	const rewatchRole = createdRoles['📺 Rewatch']
	if (rewatchChannel && rewatchRole) {
		// Bloquer @everyone
		await editChannelPermissions(rewatchChannel.id, GUILD_ID, {
			type: 0, // Role
			deny: String(CONNECT | SPEAK),
			allow: '0',
		})
		// Autoriser le rôle Rewatch
		await editChannelPermissions(rewatchChannel.id, rewatchRole.id, {
			type: 0,
			allow: String(CONNECT | SPEAK),
			deny: '0',
		})
		console.log('  ✅ 📺 Rewatch — accès restreint au rôle Rewatch')
	}

	// ── Spoilers : seuls les membres avec le rôle ⚠️ Spoilers peuvent voir ──
	const spoilersChannel = findChannel('⚠️・spoilers')
	const spoilersRole = createdRoles['⚠️ Spoilers']
	if (spoilersChannel && spoilersRole) {
		await editChannelPermissions(spoilersChannel.id, GUILD_ID, {
			type: 0,
			deny: String(VIEW_CHANNEL),
			allow: '0',
		})
		await editChannelPermissions(spoilersChannel.id, spoilersRole.id, {
			type: 0,
			allow: String(VIEW_CHANNEL | SEND_MESSAGES),
			deny: '0',
		})
		console.log('  ✅ ⚠️ Spoilers — accès restreint au rôle Spoilers')
	}

	// ── Conseil des Mages : accès pour le rôle Conseil ──
	const conseilCategory = findCategory('⚖️ CONSEIL DES MAGES')
	const conseilRole = createdRoles['⚖️ Conseil des Mages']
	if (conseilCategory && conseilRole) {
		await editChannelPermissions(conseilCategory.id, conseilRole.id, {
			type: 0,
			allow: String(VIEW_CHANNEL | SEND_MESSAGES),
			deny: '0',
		})
		console.log('  ✅ ⚖️ Conseil des Mages — accès pour les modérateurs')

		// Appliquer aussi sur les salons enfants
		const conseilChannels = channels.filter(c => c.parent_id === conseilCategory.id)
		for (const ch of conseilChannels) {
			await editChannelPermissions(ch.id, conseilRole.id, {
				type: 0,
				allow: String(VIEW_CHANNEL | SEND_MESSAGES),
				deny: '0',
			})
		}
	}

	// ── Chevalier Runique : accès au conseil aussi ──
	const chevalierRole = createdRoles['🛡️ Chevalier Runique']
	if (conseilCategory && chevalierRole) {
		await editChannelPermissions(conseilCategory.id, chevalierRole.id, {
			type: 0,
			allow: String(VIEW_CHANNEL | SEND_MESSAGES),
			deny: '0',
		})
		const conseilChannels = channels.filter(c => c.parent_id === conseilCategory.id)
		for (const ch of conseilChannels) {
			await editChannelPermissions(ch.id, chevalierRole.id, {
				type: 0,
				allow: String(VIEW_CHANNEL | SEND_MESSAGES),
				deny: '0',
			})
		}
		console.log('  ✅ 🛡️ Chevalier Runique — accès au Conseil des Mages')
	}

	// ── Administration : accès pour Maître de Guilde ──
	const adminCategory = findCategory('👑 ADMINISTRATION')
	const maitreRole = createdRoles['👑 Maître de Guilde']
	if (adminCategory && maitreRole) {
		await editChannelPermissions(adminCategory.id, maitreRole.id, {
			type: 0,
			allow: String(VIEW_CHANNEL | SEND_MESSAGES),
			deny: '0',
		})
		const adminChannels = channels.filter(c => c.parent_id === adminCategory.id)
		for (const ch of adminChannels) {
			await editChannelPermissions(ch.id, maitreRole.id, {
				type: 0,
				allow: String(VIEW_CHANNEL | SEND_MESSAGES),
				deny: '0',
			})
		}
		console.log('  ✅ 👑 Maître de Guilde — accès à l\'Administration')
	}

	// ── Gamer : accès au salon gaming vocal ──
	const gamingVocal = findChannel('🎮 Jeux vidéo')
	const gamerRole = createdRoles['🎮 Gamer']
	if (gamingVocal && gamerRole && gamingVocal.type === 2) {
		// Pas de restriction pour le vocal gaming, mais mention du rôle pour les events
		console.log('  ✅ 🎮 Gamer — rôle mentionnable pour les sessions gaming')
	}

	// ── DJ : autoriser les commandes bot musique ──
	const musiqueBotChannel = findChannel('🎵・musique-bot')
	const djRole = createdRoles['🎵 DJ']
	if (musiqueBotChannel && djRole) {
		await editChannelPermissions(musiqueBotChannel.id, djRole.id, {
			type: 0,
			allow: String(VIEW_CHANNEL | SEND_MESSAGES),
			deny: '0',
		})
		console.log('  ✅ 🎵 DJ — accès au salon musique-bot')
	}

	console.log(`\n━━━━━━━━━━ Configuration terminée ! ━━━━━━━━━━`)
	console.log(`\n📋 Résumé des rôles :`)
	console.log(`   👑 ${MODERATION_ROLES.length} rôles de modération`)
	console.log(`   ♀️  ${GENRE_ROLES.length} rôles de genre`)
	console.log(`   🔑 ${ACCESS_ROLES.length} rôles d'accès`)
	console.log(`   🏰 ${GUILD_ROLES.length} rôles de guildes`)
	console.log(`   ── ${SEPARATOR_ROLES.length} séparateurs`)
	console.log(`   Total: ${MODERATION_ROLES.length + GENRE_ROLES.length + ACCESS_ROLES.length + GUILD_ROLES.length + SEPARATOR_ROLES.length} rôles`)
}

main().catch((err) => {
	console.error('❌ Erreur:', err.message)
	process.exit(1)
})

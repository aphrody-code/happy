/**
 * Script pour créer/réorganiser TOUTE la structure du serveur Fairy Tail FR.
 * Crée les catégories et salons manquants, déplace les salons existants
 * dans les bonnes catégories, et applique les permissions.
 *
 * Usage: node scripts/setup-server.mjs
 *
 * Variables d'environnement requises :
 *   BOT_TOKEN - Token du bot Discord
 *   TEST_GUILD_ID - ID du serveur Discord
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
	if (res.status === 204) return {}

	return res.json()
}

// ── Discord channel types ──
const GUILD_TEXT = 0
const GUILD_VOICE = 2
const GUILD_CATEGORY = 4
const GUILD_STAGE_VOICE = 13

// ── Permission bits ──
const VIEW_CHANNEL = (1n << 10n).toString()
const SEND_MESSAGES = (1n << 11n).toString()
const MANAGE_MESSAGES = (1n << 13n).toString()
const EMBED_LINKS = (1n << 14n).toString()
const ATTACH_FILES = (1n << 15n).toString()
const READ_MESSAGE_HISTORY = (1n << 16n).toString()
const ADD_REACTIONS = (1n << 6n).toString()
const CONNECT = (1n << 20n).toString()
const SPEAK = (1n << 21n).toString()

function combinePerms(...perms) {
	return perms.reduce((a, b) => (BigInt(a) | BigInt(b)).toString(), '0')
}

// ══════════════════════════════════════════════════════
// Structure complète du serveur
// ══════════════════════════════════════════════════════

const SERVER_STRUCTURE = [
	{
		name: '📜 INFORMATIONS',
		defaultPerms: { everyone: { deny: SEND_MESSAGES, allow: combinePerms(VIEW_CHANNEL, READ_MESSAGE_HISTORY) } },
		channels: [
			{ name: '📜・règlement', type: GUILD_TEXT, topic: 'Le code des mages — règles du serveur Fairy Tail FR.' },
			{ name: '📢・annonces', type: GUILD_TEXT, topic: 'Annonces officielles de la guilde.' },
			{ name: '⚔️・choisir-sa-guilde', type: GUILD_TEXT, topic: 'Obtenez votre marque de guilde ici — /guilde' },
			{ name: '🎭・rôles', type: GUILD_TEXT, topic: 'Sélectionnez vos rôles d\'accès et de genre.' },
			{ name: '📖・personnages', type: GUILD_TEXT, topic: 'Galerie des mages de l\'univers Fairy Tail.' },
		],
	},
	{
		name: '💬 GÉNÉRAL',
		channels: [
			{
				name: '👋・bienvenue',
				type: GUILD_TEXT,
				topic: 'Bienvenue et au revoir — les arrivées et départs de la guilde.',
				perms: { everyone: { deny: SEND_MESSAGES, allow: combinePerms(VIEW_CHANNEL, ADD_REACTIONS) } },
			},
			{ name: '💬・discussion', type: GUILD_TEXT, topic: 'Discussion libre entre mages. Aye !' },
			{ name: '📝・présentez-vous', type: GUILD_TEXT, topic: 'Présentez-vous à la guilde ! Qui êtes-vous, mage ?' },
			{ name: '🤖・commandes-bot', type: GUILD_TEXT, topic: 'Utilisez les commandes du bot ici.' },
			{ name: '💡・suggestions', type: GUILD_TEXT, topic: 'Vos idées pour améliorer le serveur.', slowmode: 60 },
			{ name: '🐛・bugs', type: GUILD_TEXT, topic: 'Signaler un bug du bot ou du serveur.', slowmode: 30 },
		],
	},
	{
		name: '🧚 FAIRY TAIL',
		channels: [
			{ name: '📺・anime-manga', type: GUILD_TEXT, topic: 'Discussion sur l\'anime et le manga Fairy Tail.' },
			{ name: '🔮・théories', type: GUILD_TEXT, topic: 'Vos théories sur l\'univers de Fairy Tail et 100 Years Quest.' },
			{ name: '🎨・fan-art', type: GUILD_TEXT, topic: 'Partagez vos créations et fan arts Fairy Tail.' },
			{ name: '📸・médias', type: GUILD_TEXT, topic: 'Memes, clips, screenshots, GIFs Fairy Tail.' },
			{
				name: '⚠️・spoilers',
				type: GUILD_TEXT,
				topic: 'Spoilers 100 Years Quest — accès restreint.',
				restrictedRole: '⚠️ Spoilers',
			},
		],
	},
	{
		name: '⚔️ RPG & JEUX',
		channels: [
			{ name: '⚔️・aventure-rpg', type: GUILD_TEXT, topic: 'Exploration, quêtes et aventures RPG.' },
			{ name: '🏪・boutique', type: GUILD_TEXT, topic: 'Achetez des objets avec vos Joyaux — /shop' },
			{ name: '🏆・classement', type: GUILD_TEXT, topic: 'Classement des mages — /leaderboard, /rank' },
			{ name: '🎮・mini-jeux', type: GUILD_TEXT, topic: 'Mini-jeux, sondages et activités — /poll, /daily' },
		],
	},
	{
		name: '🌍 HORS-SUJET',
		channels: [
			{ name: '☕・hors-sujet', type: GUILD_TEXT, topic: 'Discussion libre hors Fairy Tail.' },
			{ name: '🎮・gaming', type: GUILD_TEXT, topic: 'Discussions gaming et sessions de jeu.' },
			{ name: '🎵・musique', type: GUILD_TEXT, topic: 'Partagez vos musiques et playlists.' },
			{
				name: '🔞・nsfw',
				type: GUILD_TEXT,
				topic: 'Contenu réservé aux +18. Accès restreint.',
				nsfw: true,
				restrictedRole: '🔞 NSFW',
			},
		],
	},
	{
		name: '🔊 VOCAUX',
		channels: [
			{ name: '🔊・Salon Général', type: GUILD_VOICE },
			{ name: '🏰・Salle de la Guilde', type: GUILD_VOICE },
			{
				name: '🎵・Musique',
				type: GUILD_VOICE,
				restrictedRole: '🎵 DJ',
				restrictVoice: true,
			},
			{
				name: '📺・Rewatch',
				type: GUILD_VOICE,
				restrictedRole: '📺 Rewatch',
				restrictVoice: true,
			},
			{ name: '🎮・Gaming', type: GUILD_VOICE },
		],
	},
	{
		name: '🎫 TICKETS',
		staffOnly: true,
		channels: [],
	},
	{
		name: '⚖️ CONSEIL DES MAGES',
		staffOnly: true,
		staffRoles: ['⚖️ Conseil des Mages', '🛡️ Chevalier Runique', '⭐ Mage de Rang S'],
		channels: [
			{ name: '💬・modération', type: GUILD_TEXT, topic: 'Discussion entre modérateurs.' },
			{ name: '📋・sanctions', type: GUILD_TEXT, topic: 'Suivi des sanctions — /warn, /ban, /kick, /modlogs' },
			{
				name: '📝・logs',
				type: GUILD_TEXT,
				topic: 'Logs automatiques du bot — audit, tickets, modération.',
				perms: { everyone: { deny: SEND_MESSAGES } },
			},
		],
	},
	{
		name: '👑 ADMINISTRATION',
		staffOnly: true,
		staffRoles: ['👑 Maître de Guilde'],
		channels: [
			{ name: '🔧・admin', type: GUILD_TEXT, topic: 'Configuration du serveur et du bot.' },
			{ name: '📊・stats-bot', type: GUILD_TEXT, topic: 'Statistiques et diagnostics du bot.' },
		],
	},
]

// ══════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════

async function main() {
	console.log('🏰 Setup du serveur Fairy Tail FR')
	console.log('═'.repeat(50))

	if (!TOKEN || !GUILD_ID) {
		console.error('❌ BOT_TOKEN et TEST_GUILD_ID requis dans .env')
		process.exit(1)
	}

	// 1. Récupérer les données existantes
	console.log('\n📡 Récupération des données du serveur...')
	const existingChannels = await apiCall('GET', `/guilds/${GUILD_ID}/channels`)
	const existingRoles = await apiCall('GET', `/guilds/${GUILD_ID}/roles`)
	if (!existingChannels || !existingRoles) {
		console.error('❌ Impossible de récupérer les données du serveur.')
		process.exit(1)
	}

	const everyoneRole = existingRoles.find(r => r.name === '@everyone')
	const rolesByName = {}
	for (const r of existingRoles) {
		rolesByName[r.name] = r
	}

	console.log(`  ${existingChannels.length} salons existants`)
	console.log(`  ${existingRoles.length} rôles existants`)

	// 2. Créer les rôles de rang s'ils n'existent pas
	const levelRoles = [
		{ name: 'Mage Classe D', color: '#95A5A6' },
		{ name: 'Mage Classe C', color: '#3498DB' },
		{ name: 'Mage Classe B', color: '#2ECC71' },
		{ name: 'Mage Classe A', color: '#E74C3C' },
		{ name: 'Mage Classe S', color: '#F1C40F' },
		{ name: 'Mage Classe SS', color: '#9B59B6' },
	]

	console.log('\n⚔️ Vérification des rôles de rang...')
	for (const lr of levelRoles) {
		if (!rolesByName[lr.name]) {
			const role = await apiCall('POST', `/guilds/${GUILD_ID}/roles`, {
				name: lr.name,
				color: Number.parseInt(lr.color.replace('#', ''), 16),
				hoist: false,
				mentionable: false,
			})
			if (role) {
				rolesByName[role.name] = role
				console.log(`  ✅ Rôle créé : ${lr.name}`)
			}
		} else {
			console.log(`  ✓ Existe déjà : ${lr.name}`)
		}
	}

	// 3. Traiter chaque catégorie
	const existingCategories = existingChannels.filter(c => c.type === GUILD_CATEGORY)
	const existingTextVoice = existingChannels.filter(c => c.type !== GUILD_CATEGORY)

	let position = 0

	for (const cat of SERVER_STRUCTURE) {
		console.log(`\n${'─'.repeat(50)}`)
		console.log(`📂 ${cat.name}`)

		// Trouver ou créer la catégorie
		let category = existingCategories.find(c => c.name === cat.name)

		if (!category) {
			// Construire les permission overwrites de la catégorie
			const permissionOverwrites = []

			if (cat.staffOnly) {
				// Catégorie cachée par défaut
				permissionOverwrites.push({
					id: everyoneRole.id,
					type: 0, // role
					deny: VIEW_CHANNEL,
				})

				// Donner accès aux rôles staff
				const staffRoles = cat.staffRoles || []
				for (const roleName of staffRoles) {
					const role = rolesByName[roleName]
					if (role) {
						permissionOverwrites.push({
							id: role.id,
							type: 0,
							allow: combinePerms(VIEW_CHANNEL, SEND_MESSAGES),
						})
					}
				}
			}

			if (cat.defaultPerms?.everyone) {
				const p = cat.defaultPerms.everyone
				const overwrite = { id: everyoneRole.id, type: 0 }
				if (p.deny) overwrite.deny = p.deny
				if (p.allow) overwrite.allow = p.allow
				permissionOverwrites.push(overwrite)
			}

			category = await apiCall('POST', `/guilds/${GUILD_ID}/channels`, {
				name: cat.name,
				type: GUILD_CATEGORY,
				position,
				permission_overwrites: permissionOverwrites,
			})

			if (category) {
				console.log(`  ✅ Catégorie créée : ${cat.name}`)
			} else {
				console.error(`  ❌ Impossible de créer la catégorie ${cat.name}`)
				position++
				continue
			}
		} else {
			console.log(`  ✓ Catégorie existe : ${cat.name}`)
		}

		position++

		// Traiter chaque salon de la catégorie
		for (const ch of cat.channels) {
			// Chercher un salon existant avec le même nom (ou un nom similaire sans emojis)
			const cleanName = ch.name.replace(/[^\w\s-]/g, '').trim().toLowerCase()
			const existing = existingTextVoice.find(c =>
				c.name === ch.name
				|| c.name.replace(/[^\w\s-]/g, '').trim().toLowerCase() === cleanName
			)

			if (existing) {
				// Déplacer dans la bonne catégorie si nécessaire
				if (existing.parent_id !== category.id) {
					await apiCall('PATCH', `/channels/${existing.id}`, {
						parent_id: category.id,
						topic: ch.topic || existing.topic,
					})
					console.log(`  ↪️ Déplacé : ${existing.name} → ${cat.name}`)
				} else {
					console.log(`  ✓ Existe : ${ch.name}`)
				}

				// Mettre à jour le topic si différent
				if (ch.topic && existing.topic !== ch.topic) {
					await apiCall('PATCH', `/channels/${existing.id}`, { topic: ch.topic })
				}
			} else {
				// Créer le salon
				const channelData = {
					name: ch.name,
					type: ch.type,
					parent_id: category.id,
					topic: ch.topic || undefined,
					nsfw: ch.nsfw || false,
					rate_limit_per_user: ch.slowmode || 0,
					permission_overwrites: [],
				}

				// Permissions spécifiques au salon
				if (ch.perms?.everyone) {
					const p = ch.perms.everyone
					const overwrite = { id: everyoneRole.id, type: 0 }
					if (p.deny) overwrite.deny = p.deny
					if (p.allow) overwrite.allow = p.allow
					channelData.permission_overwrites.push(overwrite)
				}

				// Salon restreint à un rôle
				if (ch.restrictedRole) {
					const role = rolesByName[ch.restrictedRole]
					if (role) {
						// Deny pour @everyone
						channelData.permission_overwrites.push({
							id: everyoneRole.id,
							type: 0,
							deny: ch.restrictVoice ? CONNECT : VIEW_CHANNEL,
						})
						// Allow pour le rôle
						channelData.permission_overwrites.push({
							id: role.id,
							type: 0,
							allow: ch.restrictVoice
								? combinePerms(CONNECT, SPEAK)
								: combinePerms(VIEW_CHANNEL, SEND_MESSAGES),
						})
					}
				}

				const created = await apiCall('POST', `/guilds/${GUILD_ID}/channels`, channelData)
				if (created) {
					console.log(`  ✅ Salon créé : ${ch.name}`)
				}
			}
		}
	}

	// 4. Vérifier les salons orphelins (pas dans une catégorie définie)
	console.log(`\n${'─'.repeat(50)}`)
	console.log('🔍 Salons non catégorisés (orphelins) :')
	const definedCategoryNames = SERVER_STRUCTURE.map(s => s.name)
	const refreshedChannels = await apiCall('GET', `/guilds/${GUILD_ID}/channels`)
	const refreshedCategories = refreshedChannels.filter(c => c.type === GUILD_CATEGORY)
	const knownCategoryIds = refreshedCategories
		.filter(c => definedCategoryNames.includes(c.name))
		.map(c => c.id)

	const orphans = refreshedChannels.filter(c =>
		c.type !== GUILD_CATEGORY
		&& (!c.parent_id || !knownCategoryIds.includes(c.parent_id))
	)

	if (orphans.length === 0) {
		console.log('  ✓ Aucun salon orphelin.')
	} else {
		for (const o of orphans) {
			const parentName = o.parent_id
				? refreshedCategories.find(c => c.id === o.parent_id)?.name || '???'
				: '(aucune catégorie)'
			console.log(`  ⚠️ ${o.name} (type: ${o.type}) — dans : ${parentName}`)
		}
	}

	console.log(`\n${'═'.repeat(50)}`)
	console.log('✅ Setup du serveur terminé !')
	console.log('\nProchaines étapes :')
	console.log('  1. node scripts/setup-roles.mjs — créer les rôles')
	console.log('  2. node scripts/setup-server.mjs — (ce script) créer les salons')
	console.log('  3. node scripts/setup-roles-channel.ts — menu de sélection de guilde')
	console.log('  4. node scripts/setup-channel.ts — règlement détaillé')
	console.log('  5. node scripts/setup-presentations.ts — fiches personnages')
}

main().catch(console.error)

/**
 * Script autonome pour exécuter la logique de /setup via l'API Discord REST.
 * Usage: node scripts/run-setup.mjs
 */
import 'dotenv/config'

const TOKEN = process.env.BOT_TOKEN
const GUILD_ID = process.env.TEST_GUILD_ID
const API = `https://discord.com/api/v10`

const headers = {
	'Authorization': `Bot ${TOKEN}`,
	'Content-Type': 'application/json',
}

// Types de channels Discord
const ChannelType = {
	GuildText: 0,
	GuildVoice: 2,
	GuildCategory: 4,
	GuildAnnouncement: 0, // Fallback vers texte si le serveur n'a pas le mode Communauté
	GuildForum: 15,
}

// ── Structure identique à setup.ts ──

const SERVER_STRUCTURE = [
	{
		name: '📜 INFORMATIONS',
		channels: [
			{ name: '📢・annonces', type: ChannelType.GuildAnnouncement, topic: 'Annonces officielles du serveur Fairy Tail FR' },
			{ name: '📋・règlement', type: ChannelType.GuildText, topic: 'Règlement du serveur — lisez avant de participer' },
			{ name: '🎭・rôles', type: ChannelType.GuildText, topic: 'Obtenez vos rôles ici avec /guilde' },
			{ name: '👋・bienvenue', type: ChannelType.GuildText, topic: 'Bienvenue aux nouveaux membres !' },
			{ name: '📝・présentations', type: ChannelType.GuildText, topic: 'Présentez-vous à la communauté Fairy Tail FR !' },
			{ name: '💡・suggestions', type: ChannelType.GuildText, topic: 'Proposez vos idées pour améliorer le serveur' },
		],
	},
	{
		name: '🍺 BAR DE LA GUILDE',
		channels: [
			{ name: '💬・discussion-générale', type: ChannelType.GuildText, topic: 'Discussion au bar de la guilde — installez-vous et discutez !' },
			{ name: '🍔・hors-sujet', type: ChannelType.GuildText, topic: 'Discussions hors-sujet — tout est permis (dans le respect)' },
			{ name: '🖼️・médias', type: ChannelType.GuildText, topic: 'Partagez vos images, vidéos et liens' },
			{ name: '😂・memes', type: ChannelType.GuildText, topic: 'Memes et humour Fairy Tail' },
			{ name: '📸・cosplay', type: ChannelType.GuildText, topic: 'Partagez vos cosplays Fairy Tail' },
			{ name: '🎵・musique', type: ChannelType.GuildText, topic: 'Partagez vos musiques et OST Fairy Tail préférées' },
		],
	},
	{
		name: '🤖 BOTS',
		channels: [
			{ name: '🤖・commandes', type: ChannelType.GuildText, topic: 'Utilisez les commandes du bot ici' },
			{ name: '🎵・musique-bot', type: ChannelType.GuildText, topic: 'Commandes du bot musique — jouez vos OST préférées' },
			{ name: '🎮・mini-jeux', type: ChannelType.GuildText, topic: 'Mini-jeux, quiz et commandes ludiques' },
		],
	},
	{
		name: '🧚 FAIRY TAIL',
		channels: [
			{ name: '📖・manga', type: ChannelType.GuildText, topic: 'Discussion sur le manga Fairy Tail & 100 Years Quest' },
			{ name: '📺・anime', type: ChannelType.GuildText, topic: 'Discussion sur l\'anime Fairy Tail' },
			{ name: '🎨・fan-art', type: ChannelType.GuildText, topic: 'Partagez vos créations et fan-arts' },
			{ name: '💭・théories', type: ChannelType.GuildText, topic: 'Vos théories et spéculations sur Fairy Tail' },
			{ name: '⚔️・combats-favoris', type: ChannelType.GuildText, topic: 'Débattez des meilleurs combats de la série' },
			{ name: '🏆・top-personnages', type: ChannelType.GuildText, topic: 'Classements et débats sur les personnages' },
			{ name: '✨・magies-et-pouvoirs', type: ChannelType.GuildText, topic: 'Discussion sur les magies, pouvoirs et capacités' },
			{ name: '⚠️・spoilers', type: ChannelType.GuildText, topic: '⚠️ SPOILERS — Derniers chapitres et épisodes, entrez à vos risques' },
		],
	},
	{
		name: '📚 ARCS & SAGAS',
		channels: [
			{ name: '📚・forum-arcs', type: ChannelType.GuildForum, topic: 'Créez un fil pour discuter de votre arc préféré !' },
			{ name: '🌅・macao-à-galuna', type: ChannelType.GuildText, topic: 'Arcs du début — Macao, Daybreak, Lullaby, Galuna' },
			{ name: '👻・phantom-lord', type: ChannelType.GuildText, topic: 'Arc Phantom Lord — La guerre des guildes' },
			{ name: '🗼・tour-du-paradis', type: ChannelType.GuildText, topic: 'Arc Tour du Paradis — Gerald et le Système R' },
			{ name: '⚡・battle-of-fairy-tail', type: ChannelType.GuildText, topic: 'Arc Battle of Fairy Tail — La révolte de Luxus' },
			{ name: '🐍・oración-seis', type: ChannelType.GuildText, topic: 'Arc Oración Seis — L\'Alliance des Guildes Légales' },
			{ name: '🌀・edolas', type: ChannelType.GuildText, topic: 'Arc Edolas — Le monde parallèle' },
			{ name: '🏝️・île-tenrô', type: ChannelType.GuildText, topic: 'Arc Île Tenrô — Acnologia et les Sept Kin de Purgatoire' },
			{ name: '🏟️・grands-jeux-magiques', type: ChannelType.GuildText, topic: 'Arc des Grands Jeux Magiques — Le tournoi des guildes' },
			{ name: '🐉・éclipse', type: ChannelType.GuildText, topic: 'Arc Éclipse — Les Dragons du futur' },
			{ name: '👿・tartaros', type: ChannelType.GuildText, topic: 'Arc Tartaros — Les démons de Zeleph' },
			{ name: '⚔️・arbaless', type: ChannelType.GuildText, topic: 'Arc Arbaless — La guerre contre l\'Empire Alvarez' },
			{ name: '🔮・100-years-quest', type: ChannelType.GuildText, topic: 'Fairy Tail : 100 Years Quest — La suite de l\'aventure' },
		],
	},
	{
		name: '🏰 GUILDES',
		channels: [
			{ name: '🏆・classement-guildes', type: ChannelType.GuildText, topic: 'Classement des guildes par nombre de membres' },
			{ name: '💬・discussion-guildes', type: ChannelType.GuildText, topic: 'Discussion entre les membres des différentes guildes' },
			{ name: '⚔️・inter-guildes', type: ChannelType.GuildText, topic: 'Événements et défis inter-guildes' },
			{ name: '📋・tableau-des-quêtes', type: ChannelType.GuildText, topic: 'Tableau des quêtes — Missions et défis communautaires' },
		],
	},
	{
		name: '🎮 DIVERTISSEMENT',
		channels: [
			{ name: '🎮・jeux', type: ChannelType.GuildText, topic: 'Jeux, quiz et mini-jeux Fairy Tail' },
			{ name: '📺・autres-animes', type: ChannelType.GuildText, topic: 'Discussion sur d\'autres animes et mangas' },
			{ name: '🎬・films-et-séries', type: ChannelType.GuildText, topic: 'Films, séries et culture geek' },
			{ name: '🕹️・gaming', type: ChannelType.GuildText, topic: 'Jeux vidéo — trouvez des partenaires de jeu' },
		],
	},
	{
		name: '🔊 VOCAL',
		channels: [
			{ name: '🔊 Général', type: ChannelType.GuildVoice },
			{ name: '🍺 Bar de la Guilde', type: ChannelType.GuildVoice },
			{ name: '📺 Rewatch', type: ChannelType.GuildVoice },
			{ name: '🎵 Musique', type: ChannelType.GuildVoice },
			{ name: '🎮 Jeux vidéo', type: ChannelType.GuildVoice },
			{ name: '🔇 Muet — Travail', type: ChannelType.GuildVoice },
		],
	},
	{
		name: '⚖️ CONSEIL DES MAGES',
		adminOnly: true,
		channels: [
			{ name: '⚖️・conseil', type: ChannelType.GuildText, topic: 'Discussion du Conseil des Mages — décisions et modération', adminOnly: true },
			{ name: '📋・sanctions', type: ChannelType.GuildText, topic: 'Historique des sanctions et avertissements', adminOnly: true },
			{ name: '📊・rapports', type: ChannelType.GuildText, topic: 'Rapports de signalement des membres', adminOnly: true },
		],
	},
	{
		name: '👑 ADMINISTRATION',
		adminOnly: true,
		channels: [
			{ name: '📝・logs', type: ChannelType.GuildText, topic: 'Logs du bot et du serveur', adminOnly: true },
			{ name: '🛠️・admin', type: ChannelType.GuildText, topic: 'Discussion entre administrateurs', adminOnly: true },
			{ name: '📊・stats', type: ChannelType.GuildText, topic: 'Statistiques du serveur et du bot', adminOnly: true },
			{ name: '🧪・test-bot', type: ChannelType.GuildText, topic: 'Salon de test pour les commandes du bot', adminOnly: true },
		],
	},
]

// ── Helpers API ──

async function apiCall(method, path, body) {
	const res = await fetch(`${API}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	})
	if (!res.ok) {
		const text = await res.text()
		throw new Error(`${method} ${path} → ${res.status}: ${text}`)
	}
	// Respecter le rate limit
	const remaining = res.headers.get('x-ratelimit-remaining')
	if (remaining === '0') {
		const resetAfter = Number.parseFloat(res.headers.get('x-ratelimit-reset-after') || '1')
		console.log(`  ⏳ Rate limit atteint, pause ${resetAfter.toFixed(1)}s...`)
		await new Promise(r => setTimeout(r, resetAfter * 1000 + 100))
	}

	return res.json()
}

async function getGuildChannels() {
	return apiCall('GET', `/guilds/${GUILD_ID}/channels`)
}

async function getBotUser() {
	return apiCall('GET', '/users/@me')
}

async function createChannel(data) {
	return apiCall('POST', `/guilds/${GUILD_ID}/channels`, data)
}

// ── Main ──

async function main() {
	console.log('🚀 Exécution du setup du serveur...\n')

	const botUser = await getBotUser()
	console.log(`🤖 Bot: ${botUser.username}#${botUser.discriminator}`)
	console.log(`🏠 Guild: ${GUILD_ID}\n`)

	const existingChannels = await getGuildChannels()
	console.log(`📋 ${existingChannels.length} salons existants\n`)

	let createdCategories = 0
	let createdChannels = 0
	let skippedChannels = 0

	for (const categoryDef of SERVER_STRUCTURE) {
		// Chercher si la catégorie existe déjà
		let category = existingChannels.find(
			c => c.type === ChannelType.GuildCategory && c.name === categoryDef.name
		)

		if (!category) {
			const payload = {
				name: categoryDef.name,
				type: ChannelType.GuildCategory,
			}

			if (categoryDef.adminOnly) {
				payload.permission_overwrites = [
					{
						id: GUILD_ID, // @everyone
						deny: String(1 << 10), // ViewChannel
						type: 0, // Role
					},
					{
						id: botUser.id,
						allow: String(1 << 10), // ViewChannel
						type: 1, // Member
					},
				]
			}

			category = await createChannel(payload)
			existingChannels.push(category)
			createdCategories++
			console.log(`📂 Catégorie créée: ${categoryDef.name}`)
		} else {
			console.log(`📂 Catégorie existante: ${categoryDef.name}`)
		}

		// Créer les salons
		for (const channelDef of categoryDef.channels) {
			const existing = existingChannels.find(
				c => c.name === channelDef.name && c.parent_id === category.id
			)

			if (existing) {
				skippedChannels++
				continue
			}

			const payload = {
				name: channelDef.name,
				type: channelDef.type,
				parent_id: category.id,
			}
			if (channelDef.topic) payload.topic = channelDef.topic

			const created = await createChannel(payload)
			existingChannels.push(created)
			createdChannels++
			console.log(`  ✅ ${channelDef.name}`)
		}
	}

	console.log(`\n━━━━━━━━━━ Setup terminé ! ━━━━━━━━━━`)
	console.log(`📂 ${createdCategories} catégories créées`)
	console.log(`💬 ${createdChannels} salons créés`)
	console.log(`⏭️  ${skippedChannels} salons ignorés (déjà existants)`)
}

main().catch((err) => {
	console.error('❌ Erreur:', err.message)
	process.exit(1)
})

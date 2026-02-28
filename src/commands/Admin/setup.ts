import { Category } from '@discordx/utilities'
import {
	ChannelType,
	CommandInteraction,
	EmbedBuilder,
	OverwriteType,
	PermissionFlagsBits,
} from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash } from '@/decorators'
import { Guard, UserPermissions } from '@/guards'
import { getColor, resolveGuild } from '@/utils/functions'

// ─── Structure des salons à créer ────────────────────────────────────────────

interface ChannelDef {
	name: string
	type: ChannelType.GuildText | ChannelType.GuildVoice | ChannelType.GuildForum | ChannelType.GuildAnnouncement
	topic?: string
	adminOnly?: boolean
}

interface CategoryDef {
	name: string
	channels: ChannelDef[]
	adminOnly?: boolean
}

const SERVER_STRUCTURE: CategoryDef[] = [

	// ── Accueil et informations essentielles ──
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

	// ── Le bar emblématique de Fairy Tail — détente et discussion générale ──
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

	// ── Salons réservés aux bots ──
	{
		name: '🤖 BOTS',
		channels: [
			{ name: '🤖・commandes', type: ChannelType.GuildText, topic: 'Utilisez les commandes du bot ici' },
			{ name: '🎵・musique-bot', type: ChannelType.GuildText, topic: 'Commandes du bot musique — jouez vos OST préférées' },
			{ name: '🎮・mini-jeux', type: ChannelType.GuildText, topic: 'Mini-jeux, quiz et commandes ludiques' },
		],
	},

	// ── Discussion générale sur Fairy Tail ──
	{
		name: '🧚 FAIRY TAIL',
		channels: [
			{ name: '📖・manga', type: ChannelType.GuildText, topic: 'Discussion sur le manga Fairy Tail & 100 Years Quest' },
			{ name: '📺・anime', type: ChannelType.GuildText, topic: "Discussion sur l'anime Fairy Tail" },
			{ name: '🎨・fan-art', type: ChannelType.GuildText, topic: 'Partagez vos créations et fan-arts' },
			{ name: '💭・théories', type: ChannelType.GuildText, topic: 'Vos théories et spéculations sur Fairy Tail' },
			{ name: '⚔️・combats-favoris', type: ChannelType.GuildText, topic: 'Débattez des meilleurs combats de la série' },
			{ name: '🏆・top-personnages', type: ChannelType.GuildText, topic: 'Classements et débats sur les personnages' },
			{ name: '✨・magies-et-pouvoirs', type: ChannelType.GuildText, topic: 'Discussion sur les magies, pouvoirs et capacités' },
			{ name: '⚠️・spoilers', type: ChannelType.GuildText, topic: '⚠️ SPOILERS — Derniers chapitres et épisodes, entrez à vos risques' },
		],
	},

	// ── Discussion organisée par arc narratif ──
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

	// ── Système de guildes du serveur ──
	{
		name: '🏰 GUILDES',
		channels: [
			{ name: '🏆・classement-guildes', type: ChannelType.GuildText, topic: 'Classement des guildes par nombre de membres' },
			{ name: '💬・discussion-guildes', type: ChannelType.GuildText, topic: 'Discussion entre les membres des différentes guildes' },
			{ name: '⚔️・inter-guildes', type: ChannelType.GuildText, topic: 'Événements et défis inter-guildes' },
			{ name: '📋・tableau-des-quêtes', type: ChannelType.GuildText, topic: 'Tableau des quêtes — Missions et défis communautaires' },
		],
	},

	// ── Divertissement et culture ──
	{
		name: '🎮 DIVERTISSEMENT',
		channels: [
			{ name: '🎮・jeux', type: ChannelType.GuildText, topic: 'Jeux, quiz et mini-jeux Fairy Tail' },
			{ name: '📺・autres-animes', type: ChannelType.GuildText, topic: 'Discussion sur d\'autres animes et mangas' },
			{ name: '🎬・films-et-séries', type: ChannelType.GuildText, topic: 'Films, séries et culture geek' },
			{ name: '🕹️・gaming', type: ChannelType.GuildText, topic: 'Jeux vidéo — trouvez des partenaires de jeu' },
		],
	},

	// ── Salons vocaux ──
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

	// ── Conseil des Mages — espace modération (thème Fairy Tail) ──
	{
		name: '⚖️ CONSEIL DES MAGES',
		adminOnly: true,
		channels: [
			{ name: '⚖️・conseil', type: ChannelType.GuildText, topic: 'Discussion du Conseil des Mages — décisions et modération', adminOnly: true },
			{ name: '📋・sanctions', type: ChannelType.GuildText, topic: 'Historique des sanctions et avertissements', adminOnly: true },
			{ name: '📊・rapports', type: ChannelType.GuildText, topic: 'Rapports de signalement des membres', adminOnly: true },
		],
	},

	// ── Administration technique ──
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

// ─── Commande /setup ─────────────────────────────────────────────────────────

@Discord()
@Injectable()
@Category('Admin')
export default class SetupCommand {

	@Slash({ name: 'setup' })
	@Guard(
		UserPermissions(['Administrator'])
	)
	async setup(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.SETUP.EMBED.TITLE())
			.setDescription(localize.COMMANDS.SETUP.EMBED.PROGRESS())
			.setColor(getColor('guildeDefault'))

		await interaction.followUp({ embeds: [embed] })

		let createdCategories = 0
		let createdChannels = 0
		let skippedChannels = 0

		for (const categoryDef of SERVER_STRUCTURE) {
			// Vérifier si la catégorie existe déjà
			let category = guild.channels.cache.find(
				c => c.type === ChannelType.GuildCategory && c.name === categoryDef.name
			)

			if (!category) {
				const permissionOverwrites = categoryDef.adminOnly
					? [
						{
							id: guild.id,
							deny: [PermissionFlagsBits.ViewChannel],
							type: OverwriteType.Role as const,
						},
						{
							id: client.user!.id,
							allow: [PermissionFlagsBits.ViewChannel],
							type: OverwriteType.Member as const,
						},
					]
					: []

				category = await guild.channels.create({
					name: categoryDef.name,
					type: ChannelType.GuildCategory,
					permissionOverwrites: permissionOverwrites.length > 0 ? permissionOverwrites : undefined,
				})
				createdCategories++
			}

			// Créer les salons dans la catégorie
			for (const channelDef of categoryDef.channels) {
				// Vérifier si le salon existe déjà
				const existing = guild.channels.cache.find(
					c => c.name === channelDef.name && c.parentId === category!.id
				)

				if (existing) {
					skippedChannels++
					continue
				}

				await guild.channels.create({
					name: channelDef.name,
					type: channelDef.type,
					parent: category.id,
					topic: channelDef.topic,
				})
				createdChannels++
			}
		}

		// Embed de confirmation
		const resultEmbed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.SETUP.EMBED.DONE_TITLE())
			.setDescription(localize.COMMANDS.SETUP.EMBED.DONE_DESCRIPTION({
				categories: createdCategories,
				channels: createdChannels,
				skipped: skippedChannels,
			}))
			.setColor(0x57F287)
			.addFields(
				SERVER_STRUCTURE.map(cat => ({
					name: cat.name,
					value: cat.channels.map(ch => `\`${ch.name}\``).join('\n'),
					inline: true,
				}))
			)

		await interaction.editReply({ embeds: [resultEmbed] })
	}

}

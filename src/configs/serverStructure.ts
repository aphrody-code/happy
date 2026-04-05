import { ChannelType, OverwriteType, PermissionFlagsBits } from 'discord.js'

// ── Types ──

export type ChannelDef = {
	name: string
	type: ChannelType.GuildText | ChannelType.GuildVoice | ChannelType.GuildForum | ChannelType.GuildStageVoice
	topic?: string
	nsfw?: boolean
	rateLimitPerUser?: number // slowmode en secondes
	permissionOverwrites?: PermOverwrite[]
}

export type PermOverwrite = {

	/** 'everyone' = @everyone, sinon le nom exact du rôle */
	target: string
	type: OverwriteType
	allow?: bigint[]
	deny?: bigint[]
}

export type CategoryDef = {
	name: string
	permissionOverwrites?: PermOverwrite[]
	channels: ChannelDef[]
}

// ── Raccourcis de permissions ──

const VIEW = PermissionFlagsBits.ViewChannel
const SEND = PermissionFlagsBits.SendMessages
const CONNECT = PermissionFlagsBits.Connect
const SPEAK = PermissionFlagsBits.Speak
const ADD_REACTIONS = PermissionFlagsBits.AddReactions
const MANAGE_MSGS = PermissionFlagsBits.ManageMessages
const READ_HISTORY = PermissionFlagsBits.ReadMessageHistory

// ── Structure complète du serveur ──

export const SERVER_STRUCTURE: CategoryDef[] = [

	// ══════════════════════════════════════════
	// 1. INFORMATIONS — Lecture seule
	// ══════════════════════════════════════════
	{
		name: '📌 INFORMATIONS',
		permissionOverwrites: [
			{ target: 'everyone', type: OverwriteType.Role, deny: [SEND], allow: [VIEW, READ_HISTORY] },
		],
		channels: [
			{
				name: '📜・règles',
				type: ChannelType.GuildText,
				topic: 'Le code sacré des mages — règles du serveur Fairy Tail FR.',
			},
			{
				name: '📢・annonces',
				type: ChannelType.GuildText,
				topic: 'Proclamations officielles du Maître de la Guilde.',
			},
			{
				name: '⚔️・guildes',
				type: ChannelType.GuildText,
				topic: 'Obtenez votre marque de guilde ici — /guilde',
			},
			{
				name: '📖・personnages',
				type: ChannelType.GuildText,
				topic: 'Galerie des mages emblématiques de l\'univers Fairy Tail.',
			},
			{
				name: '📰・actus',
				type: ChannelType.GuildText,
				topic: 'Dernières nouvelles du Royaume de Fiore et de l\'univers Fairy Tail.',
			},
		],
	},

	// ══════════════════════════════════════════
	// 2. FAIRY TAIL — Discussion & contenu
	// ══════════════════════════════════════════
	{
		name: '🧚 FAIRY TAIL',
		channels: [
			// — Communauté —
			{
				name: '👋・bienvenue',
				type: ChannelType.GuildText,
				topic: 'Bienvenue et au revoir — les arrivées et départs de la guilde.',
				permissionOverwrites: [
					{ target: 'everyone', type: OverwriteType.Role, deny: [SEND], allow: [VIEW, ADD_REACTIONS] },
				],
			},
			{
				name: '💬・général',
				type: ChannelType.GuildText,
				topic: 'Discussion libre entre mages au comptoir de Mirajane. Aye !',
			},
			{
				name: '✍️・présentations',
				type: ChannelType.GuildText,
				topic: 'Présentez-vous, mage !',
			},
			{
				name: '🤖・commandes',
				type: ChannelType.GuildText,
				topic: 'Interagissez avec le bot ici.',
			},
			{
				name: '💡・suggestions',
				type: ChannelType.GuildText,
				topic: 'Vos idées et suggestions pour améliorer la guilde.',
				rateLimitPerUser: 60,
			},
			{
				name: '🐛・bugs',
				type: ChannelType.GuildText,
				topic: 'Signaler un bug du bot ou du serveur.',
				rateLimitPerUser: 30,
			},
			// — Fairy Tail —
			{
				name: '📺・anime',
				type: ChannelType.GuildText,
				topic: 'Discussion sur l\'anime et le manga Fairy Tail — pas de spoilers sans balise !',
			},
			{
				name: '🔮・théories',
				type: ChannelType.GuildText,
				topic: 'Vos théories sur l\'univers de Fairy Tail et 100 Years Quest.',
			},
			{
				name: '🎨・fan-art',
				type: ChannelType.GuildText,
				topic: 'Partagez vos créations et fan arts Fairy Tail.',
			},
			{
				name: '⚠️・spoilers',
				type: ChannelType.GuildText,
				topic: 'Spoilers 100 Years Quest et contenu non adapté en anime — accès restreint.',
				permissionOverwrites: [
					{ target: 'everyone', type: OverwriteType.Role, deny: [VIEW] },
					{ target: '⚠️ Spoilers', type: OverwriteType.Role, allow: [VIEW, SEND] },
				],
			},
			{
				name: '😂・memes',
				type: ChannelType.GuildText,
				topic: 'Les meilleures blagues et memes de la guilde.',
			},
			{
				name: '🎭・cosplay',
				type: ChannelType.GuildText,
				topic: 'Vos cosplays Fairy Tail — montrez votre marque !',
			},
			{
				name: '⚔️・débats',
				type: ChannelType.GuildText,
				topic: 'Débats sur les combats et l\'univers de Fairy Tail.',
			},
			{
				name: '🏆・tier-list',
				type: ChannelType.GuildText,
				topic: 'Classez et débattez sur les personnages les plus puissants.',
			},
			{
				name: '✨・pouvoirs',
				type: ChannelType.GuildText,
				topic: 'Discussion sur les différentes magies et pouvoirs de l\'univers.',
			},
			{
				name: '💕・ships',
				type: ChannelType.GuildForum,
				topic: 'Débattez de vos couples préférés ! Un fil par ship.',
			},
		],
	},

	// ══════════════════════════════════════════
	// 3. RPG — Aventure et quêtes
	// ══════════════════════════════════════════
	{
		name: '⚔️ RPG',
		channels: [
			{
				name: '🗺️・aventure',
				type: ChannelType.GuildText,
				topic: 'Explorez Fiore, combattez et faites des quêtes — /rpg explorer',
			},
			{
				name: '🏪・boutique',
				type: ChannelType.GuildText,
				topic: 'Achetez des objets et équipements avec vos Joyaux — /shop',
			},
			{
				name: '📋・quêtes',
				type: ChannelType.GuildText,
				topic: 'Missions disponibles et suivi de vos quêtes en cours.',
			},
			{
				name: '🏆・classement',
				type: ChannelType.GuildText,
				topic: 'Classement des mages les plus puissants — /leaderboard',
			},
			{
				name: '🤖・commandes-rpg',
				type: ChannelType.GuildText,
				topic: 'Toutes les commandes RPG ici — /rpg, /daily, /shop, /rank, /inventaire',
			},
		],
	},

	// ══════════════════════════════════════════
	// 4. HORS-SUJET — Discussions hors Fairy Tail
	// ══════════════════════════════════════════
	{
		name: '☕ HORS-SUJET',
		channels: [
			{
				name: '💬・blabla',
				type: ChannelType.GuildText,
				topic: 'Discussion libre — la vie, les autres anime, etc.',
			},
			{
				name: '🎮・gaming',
				type: ChannelType.GuildText,
				topic: 'Discussions gaming et sessions de jeu entre mages.',
				permissionOverwrites: [
					{ target: '🎮 Gamer', type: OverwriteType.Role, allow: [VIEW, SEND] },
				],
			},
			{
				name: '🎵・musique',
				type: ChannelType.GuildText,
				topic: 'Partagez vos musiques, playlists et OST préférés.',
			},
			{
				name: '📺・séries',
				type: ChannelType.GuildText,
				topic: 'Autres anime, films, séries et mangas hors Fairy Tail.',
			},
			{
				name: '🔞・nsfw',
				type: ChannelType.GuildText,
				topic: 'Contenu réservé aux +18. Accès restreint.',
				nsfw: true,
				permissionOverwrites: [
					{ target: 'everyone', type: OverwriteType.Role, deny: [VIEW] },
					{ target: '🔞 NSFW', type: OverwriteType.Role, allow: [VIEW, SEND] },
				],
			},
		],
	},

	// ══════════════════════════════════════════
	// 4. VOCAL
	// ══════════════════════════════════════════
	{
		name: '🔊 VOCAL',
		channels: [
			{
				name: '🔊・Général',
				type: ChannelType.GuildVoice,
			},
			{
				name: '☕・Chill',
				type: ChannelType.GuildVoice,
			},
			{
				name: '🔒・Staff',
				type: ChannelType.GuildVoice,
			},
			{
				name: '🎵・Musique',
				type: ChannelType.GuildVoice,
				permissionOverwrites: [
					{ target: '🎵 DJ', type: OverwriteType.Role, allow: [CONNECT, SPEAK] },
				],
			},
			{
				name: '📺・Cinéma',
				type: ChannelType.GuildVoice,
				permissionOverwrites: [
					{ target: 'everyone', type: OverwriteType.Role, deny: [CONNECT] },
					{ target: '📺 Rewatch', type: OverwriteType.Role, allow: [CONNECT, SPEAK] },
				],
			},
			{
				name: '🎮・Gaming',
				type: ChannelType.GuildVoice,
			},
			{
				name: '📚・Étude',
				type: ChannelType.GuildVoice,
			},
		],
	},

	// ══════════════════════════════════════════
	// 5. TICKETS
	// ══════════════════════════════════════════
	{
		name: '🎫 TICKETS',
		permissionOverwrites: [
			{ target: 'everyone', type: OverwriteType.Role, deny: [VIEW] },
		],
		channels: [],
	},

	// ══════════════════════════════════════════
	// 6. STAFF — Modération & Administration
	// ══════════════════════════════════════════
	{
		name: '🔒 STAFF',
		permissionOverwrites: [
			{ target: 'everyone', type: OverwriteType.Role, deny: [VIEW] },
			{ target: '⚖️ Conseil des Mages', type: OverwriteType.Role, allow: [VIEW, SEND] },
			{ target: '🛡️ Chevalier Runique', type: OverwriteType.Role, allow: [VIEW, SEND] },
			{ target: '⭐ Mage de Rang S', type: OverwriteType.Role, allow: [VIEW, SEND] },
		],
		channels: [
			// — Modération —
			{
				name: '💬・discussion',
				type: ChannelType.GuildText,
				topic: 'Discussion entre modérateurs.',
			},
			{
				name: '⚖️・sanctions',
				type: ChannelType.GuildText,
				topic: 'Suivi des sanctions — /warn, /ban, /kick, /modlogs',
			},
			{
				name: '📝・logs',
				type: ChannelType.GuildText,
				topic: 'Logs du bot — audit, tickets, modération.',
				permissionOverwrites: [
					{ target: 'everyone', type: OverwriteType.Role, deny: [SEND] },
				],
			},
			// — Administration (admin uniquement) —
			{
				name: '🔧・config',
				type: ChannelType.GuildText,
				topic: 'Configuration du serveur et du bot.',
				permissionOverwrites: [
					{ target: 'everyone', type: OverwriteType.Role, deny: [VIEW] },
					{ target: '👑 Maître de Guilde', type: OverwriteType.Role, allow: [VIEW, SEND, MANAGE_MSGS] },
				],
			},
			{
				name: '🧪・test-bot',
				type: ChannelType.GuildText,
				topic: 'Laboratoire de test du bot.',
				permissionOverwrites: [
					{ target: 'everyone', type: OverwriteType.Role, deny: [VIEW] },
					{ target: '👑 Maître de Guilde', type: OverwriteType.Role, allow: [VIEW, SEND, MANAGE_MSGS] },
				],
			},
			{
				name: '📊・stats',
				type: ChannelType.GuildText,
				topic: 'Statistiques et diagnostics du bot.',
				permissionOverwrites: [
					{ target: 'everyone', type: OverwriteType.Role, deny: [VIEW] },
					{ target: '👑 Maître de Guilde', type: OverwriteType.Role, allow: [VIEW, SEND, MANAGE_MSGS] },
				],
			},
		],
	},

]

// ── Noms de salons utilisés par le bot (pour lookup) ──

export const CHANNEL_NAMES = {
	WELCOME: '👋・bienvenue',
	RULES: '📜・règles',
	ANNOUNCEMENTS: '📢・annonces',
	GUILD_SELECT: '⚔️・guildes',
	GALLERY: '📖・personnages',
	NEWS: '📰・actus',
	DISCUSSION: '💬・général',
	INTRODUCTIONS: '✍️・présentations',
	BOT_COMMANDS: '🤖・commandes',
	SUGGESTIONS: '💡・suggestions',
	LOGS: '📝・logs',
	MODERATION: '💬・discussion',
	SANCTIONS: '⚖️・sanctions',
	ADMIN: '🔧・config',
	RPG_ADVENTURE: '🗺️・aventure',
	RPG_SHOP: '🏪・boutique',
	RPG_QUESTS: '📋・quêtes',
	RPG_LEADERBOARD: '🏆・classement',
	RPG_COMMANDS: '🤖・commandes-rpg',
} as const

// ── Noms de catégories utilisés par le bot ──

export const CATEGORY_NAMES = {
	INFO: '📌 INFORMATIONS',
	FAIRY_TAIL: '🧚 FAIRY TAIL',
	OFF_TOPIC: '☕ HORS-SUJET',
	VOICE: '🔊 VOCAL',
	RPG: '⚔️ RPG',
	TICKETS: '🎫 TICKETS',
	STAFF: '🔒 STAFF',
} as const

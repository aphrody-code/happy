/* eslint-disable */
import type { BaseTranslation } from '../i18n-types'

const fr = {
	GUARDS: {
		DISABLED_COMMAND: 'Cette commande est désactivée.',
		MAINTENANCE: 'Ce bot est en mode maintenance.',
		GUILD_ONLY: "Cette commande ne peut être utilisée qu'en serveur.",
		NSFW: 'Cette commande ne peut être utilisée que dans un salon NSFW.',
	},
	ERRORS: {
		UNKNOWN: 'Une erreur est survenue.',
	},
	SHARED: {
		NO_COMMAND_DESCRIPTION: 'Aucune description fournie.',
	},
	COMMANDS: {
		INVITE: {
			DESCRIPTION: 'Invitez le bot sur votre serveur!',
			EMBED: {
				TITLE: 'Invite moi sur ton serveur!',
				DESCRIPTION: "[Clique ici]({link:string}) pour m'inviter!",
			},
		},
		PREFIX: {
			NAME: 'prefixe',
			DESCRIPTION: 'Change le préfix du bot.',
			OPTIONS: {
				PREFIX: {
					NAME: 'nouveau_prefix',
					DESCRIPTION: 'Le nouveau préfix du bot.',
				},
			},
			EMBED: {
				DESCRIPTION: 'Prefix changé en `{prefix:string}`.',
			},
		},
		MAINTENANCE: {
			DESCRIPTION: 'Met le mode maintenance du bot.',
			EMBED: {
				DESCRIPTION: 'Le mode maintenance a été définie à `{state:string}`.',
			},
		},
		STATS: {
			DESCRIPTION: 'Obtiens des statistiques sur le bot.',
			HEADERS: {
				COMMANDS: 'Commandes',
				GUILDS: 'Serveurs',
				ACTIVE_USERS: 'Utilisateurs actifs',
				USERS: 'Utilisateurs',
			},
		},
		HELP: {
			DESCRIPTION: "Obtenez de l'aide globale sur le bot et ses commandes",
			EMBED: {
				TITLE: "Pannel d'aide",
				CATEGORY_TITLE: 'Commandes de {category:string}',
			},
			SELECT_MENU: {
				TITLE: 'Sélectionnez une catégorie',
				CATEGORY_DESCRIPTION: 'Commandes de {category:string}',
			},
		},
		PING: {
			DESCRIPTION: 'Pong!',
			MESSAGE: '{member:string} Pong! Le temps de réponse était {time:number}ms.{heartbeat:string}',
		},
		GUILDE: {
			DESCRIPTION: 'Choisis ta guilde Fairy Tail !',
			EMBED: {
				TITLE: 'Choisis ta Guilde',
				DESCRIPTION: 'Sélectionne une guilde dans les menus ci-dessous pour la rejoindre. Tu ne peux appartenir qu\'à une seule guilde à la fois.',
				LEGAL_LABEL: 'Guildes Légales',
				DARK_LABEL: 'Guildes Noires & Indépendantes',
			},
			ALREADY_IN_GUILD: 'Tu es déjà membre de **{guilde:string}** !',
			SUCCESS: {
				TITLE: 'Bienvenue chez {guilde:string} !',
				DESCRIPTION: 'Tu es maintenant membre de **{guilde:string}** ! Le rôle a été attribué.',
			},
			CHANGED: {
				TITLE: 'Guilde changée !',
				DESCRIPTION: 'Tu as quitté **{oldGuilde:string}** et rejoint **{newGuilde:string}** !',
			},
			ERROR: 'Une erreur est survenue lors de l\'attribution de la guilde.',
		},
		GUILDE_INFO: {
			DESCRIPTION: 'Voir le nombre de membres de chaque guilde.',
			EMBED: {
				TITLE: 'Statistiques des Guildes',
				NO_MEMBERS: 'Aucun membre',
				MEMBER_COUNT: '{count:number} membre{{s}}',
				LEGAL_TITLE: 'Guildes Légales',
				DARK_TITLE: 'Guildes Noires',
				INDEPENDENT_TITLE: 'Guildes Indépendantes',
			},
		},
		GUILDE_RESET: {
			DESCRIPTION: 'Retirer un membre de sa guilde.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre à retirer de sa guilde.',
				},
			},
			SUCCESS: '**{member:string}** a été retiré(e) de **{guilde:string}**.',
			NOT_IN_GUILD: '**{member:string}** n\'est dans aucune guilde.',
		},
		GUILDE_RESET_ALL: {
			DESCRIPTION: 'Réinitialiser toutes les guildes du serveur.',
			SUCCESS: 'Toutes les guildes ont été réinitialisées ({count:number} supprimée{{s}}).',
			NO_MEMBERSHIPS: 'Il n\'y a aucune adhésion de guilde à réinitialiser.',
		},
		SETUP: {
			DESCRIPTION: 'Configurer tous les salons et catégories du serveur.',
			EMBED: {
				TITLE: 'Configuration du serveur',
				PROGRESS: 'Création des salons et catégories en cours, veuillez patienter...',
				DONE_TITLE: 'Configuration terminée !',
				DONE_DESCRIPTION: '**{categories:number}** catégories et **{channels:number}** salons créés ({skipped:number} ignorés).',
			},
		},
	},
} satisfies BaseTranslation

export default fr

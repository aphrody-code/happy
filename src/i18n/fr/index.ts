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
				TITLE: 'Invite-moi sur ton serveur !',
				DESCRIPTION: "[Clique ici]({link:string}) pour m'inviter ! Aye !",
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
				TITLE: "Pannel d'aide de Happy",
				CATEGORY_TITLE: 'Commandes de {category:string}',
			},
			SELECT_MENU: {
				TITLE: 'Sélectionnez une catégorie',
				CATEGORY_DESCRIPTION: 'Commandes de {category:string}',
			},
		},
		PING: {
			DESCRIPTION: 'Aye !',
			MESSAGE: "Aye ! {member:string} Le temps de réponse était de {time:number}ms. C'est aussi rapide que Max Speed !{heartbeat:string}",
		},
		GUILDE: {
			DESCRIPTION: 'Choisis ta guilde Fairy Tail !',
			EMBED: {
				TITLE: 'Choisis ta Guilde',
				DESCRIPTION: "Sélectionne une guilde dans les menus ci-dessous pour la rejoindre. Tu ne peux appartenir qu'à une seule guilde à la fois.",
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
			ERROR: "Une erreur est survenue lors de l'attribution de la guilde.",
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
			NOT_IN_GUILD: "**{member:string}** n'est dans aucune guilde.",
		},
		GUILDE_RESET_ALL: {
			DESCRIPTION: 'Réinitialiser toutes les guildes du serveur.',
			SUCCESS: 'Toutes les guildes ont été réinitialisées ({count:number} supprimée{{s}}).',
			NO_MEMBERSHIPS: "Il n'y a aucune adhésion de guilde à réinitialiser.",
		},
		HAPPY: {
			DESCRIPTION: 'Découvre Happy, le chat ailé de Fairy Tail !',
			QUOTE_TITLE: 'Citation de Happy',
			TRIVIA_TITLE: 'Le saviez-vous ?',
			WHO_TITLE: 'Qui est Happy ?',
			RANDOM_TITLE: 'Happy dit...',
			OPTIONS: {
				ACTION: {
					NAME: 'action',
					DESCRIPTION: 'Que veux-tu savoir sur Happy ?',
				},
			},
		},
		AVATAR: {
			DESCRIPTION: 'Afficher l\'avatar d\'un membre.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre dont voir l\'avatar.',
				},
			},
			EMBED: {
				TITLE: 'Avatar de {user:string}',
			},
		},
		USERINFO: {
			DESCRIPTION: 'Afficher les informations d\'un membre.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre dont voir les informations.',
				},
			},
			EMBED: {
				TITLE: 'Informations de {user:string}',
				FIELDS: {
					ID: 'Identifiant',
					CREATED: 'Compte créé le',
					JOINED: 'A rejoint le',
					ROLES: 'Rôles ({count:number})',
					BADGES: 'Badges',
					STATUS: 'Statut',
					BOT: 'Bot',
				},
			},
		},
		SERVERINFO: {
			DESCRIPTION: 'Afficher les informations du serveur.',
			EMBED: {
				TITLE: 'Informations de {guild:string}',
				FIELDS: {
					OWNER: 'Propriétaire',
					CREATED: 'Créé le',
					MEMBERS: 'Membres',
					CHANNELS: 'Salons',
					ROLES: 'Rôles',
					EMOJIS: 'Émojis',
					BOOSTS: 'Boosts',
					VERIFICATION: 'Vérification',
				},
			},
		},
		BANNER: {
			DESCRIPTION: 'Afficher la bannière d\'un membre.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre dont voir la bannière.',
				},
			},
			EMBED: {
				TITLE: 'Bannière de {user:string}',
				NO_BANNER: 'Ce membre n\'a pas de bannière.',
			},
		},
		RPG: {
			DESCRIPTION: 'Moteur de jeu Fairy Tail RPG.',
			EXPLORE_TITLE: 'Exploration à {location:string}',
			STATS_TITLE: 'Profil RPG de {user:string}',
			MOVE_SUCCESS: 'Vous vous déplacez vers {location:string}.',
			NPC_HEADER: 'Personnages présents',
			ITEM_HEADER: 'Objets trouvés',
			CONNECTION_HEADER: 'Lieux accessibles',
			LEVEL: 'Niveau {level:number}',
			XP: 'Expérience : {xp:number}',
			JEWELS: 'Joyaux : {jewels:number}',
			HP: 'PV : {hp:number}/{maxHp:number}',
			MP: 'PM : {mp:number}/{maxMp:number}',
			OPTIONS: {
				SUB: {
					EXPLORE: 'Explorer le lieu actuel.',
					MOVE: 'Se déplacer vers un autre lieu.',
					TALK: 'Parler à un personnage.',
					PROFILE: 'Afficher votre profil RPG.',
				},
				LOCATION: 'Le lieu où se rendre.',
				NPC: 'Le personnage à qui parler.',
			},
		},
		BAN: {
			NAME: 'ban',
			DESCRIPTION: 'Bannir un membre du serveur.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre à bannir.',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: 'La raison du bannissement.',
				},
				DELETE_MESSAGES: {
					NAME: 'supprimer_messages',
					DESCRIPTION: 'Nombre de jours de messages à supprimer (0-7).',
				},
			},
			ERRORS: {
				SELF: 'Tu ne peux pas te bannir toi-même.',
				BOT: 'Je ne peux pas me bannir moi-même.',
				OWNER: 'Tu ne peux pas bannir le propriétaire du serveur.',
				HIERARCHY: 'Tu ne peux pas bannir un membre avec un rôle supérieur ou égal au tien.',
				NOT_BANNABLE: "Je n'ai pas la permission de bannir ce membre.",
			},
			SUCCESS: '**{member:string}** a été banni du serveur.',
		},
		UNBAN: {
			NAME: 'unban',
			DESCRIPTION: 'Débannir un utilisateur du serveur.',
			OPTIONS: {
				USER_ID: {
					NAME: 'id_utilisateur',
					DESCRIPTION: "L'identifiant de l'utilisateur à débannir.",
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: 'La raison du débannissement.',
				},
			},
			ERRORS: {
				NOT_BANNED: "Cet utilisateur n'est pas banni.",
				INVALID_ID: "Identifiant d'utilisateur invalide.",
			},
			SUCCESS: "L'utilisateur **{user:string}** a été débanni.",
		},
		KICK: {
			NAME: 'kick',
			DESCRIPTION: 'Expulser un membre du serveur.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre à expulser.',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: "La raison de l'expulsion.",
				},
			},
			ERRORS: {
				SELF: "Tu ne peux pas t'expulser toi-même.",
				BOT: "Je ne peux pas m'expulser moi-même.",
				OWNER: 'Tu ne peux pas expulser le propriétaire du serveur.',
				HIERARCHY: 'Tu ne peux pas expulser un membre avec un rôle supérieur ou égal au tien.',
				NOT_KICKABLE: "Je n'ai pas la permission d'expulser ce membre.",
			},
			SUCCESS: '**{member:string}** a été expulsé du serveur.',
		},
		TIMEOUT: {
			NAME: 'timeout',
			DESCRIPTION: 'Mettre un membre en sourdine temporairement.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre à mettre en sourdine.',
				},
				DURATION: {
					NAME: 'duree',
					DESCRIPTION: 'La durée en minutes.',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: 'La raison de la mise en sourdine.',
				},
			},
			ERRORS: {
				SELF: 'Tu ne peux pas te mettre en sourdine toi-même.',
				BOT: 'Je ne peux pas me mettre en sourdine moi-même.',
				OWNER: 'Tu ne peux pas mettre le propriétaire en sourdine.',
				HIERARCHY: 'Tu ne peux pas mettre en sourdine un membre avec un rôle supérieur ou égal au tien.',
				NOT_MODERATABLE: "Je n'ai pas la permission de modérer ce membre.",
			},
			SUCCESS: '**{member:string}** a été mis en sourdine pour **{duration:number}** minute{{s}}.',
		},
		UNTIMEOUT: {
			NAME: 'untimeout',
			DESCRIPTION: "Retirer la mise en sourdine d'un membre.",
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre à rétablir.',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: 'La raison du retrait de sourdine.',
				},
			},
			ERRORS: {
				NOT_TIMED_OUT: "Ce membre n'est pas en sourdine.",
				NOT_MODERATABLE: "Je n'ai pas la permission de modérer ce membre.",
			},
			SUCCESS: 'La sourdine de **{member:string}** a été retirée.',
		},
		WARN: {
			NAME: 'warn',
			DESCRIPTION: 'Avertir un membre.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre à avertir.',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: "La raison de l'avertissement.",
				},
			},
			SUCCESS: '**{member:string}** a reçu un avertissement. Total actif : **{count:number}**.',
		},
		WARNINGS: {
			NAME: 'warnings',
			DESCRIPTION: "Voir ou effacer les avertissements d'un membre.",
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre dont voir les avertissements.',
				},
				ACTION: {
					NAME: 'action',
					DESCRIPTION: "L'action à effectuer.",
				},
			},
			CHOICES: {
				VIEW: 'Voir',
				CLEAR: 'Effacer',
			},
			EMBED: {
				TITLE: 'Avertissements de {member:string}',
				NO_WARNINGS: 'Aucun avertissement actif.',
				WARNING_ENTRY: '#{id:number} - par <@{moderator:string}> le {date:string} : {reason:string}',
			},
			CLEARED: 'Tous les avertissements de **{member:string}** ont été effacés ({count:number} retiré{{s}}).',
		},
		CLEAR: {
			NAME: 'clear',
			DESCRIPTION: 'Supprimer des messages en masse.',
			OPTIONS: {
				COUNT: {
					NAME: 'nombre',
					DESCRIPTION: 'Le nombre de messages à supprimer (1-100).',
				},
				USER: {
					NAME: 'utilisateur',
					DESCRIPTION: 'Filtrer par utilisateur.',
				},
				BOTS_ONLY: {
					NAME: 'bots_seulement',
					DESCRIPTION: 'Ne supprimer que les messages des bots.',
				},
				CONTAINS: {
					NAME: 'contient',
					DESCRIPTION: 'Ne supprimer que les messages contenant ce texte.',
				},
			},
			ERRORS: {
				NO_MESSAGES: 'Aucun message correspondant trouvé.',
			},
			SUCCESS: '**{count:number}** message{{s}} supprimé{{s}}.',
		},
		SLOWMODE: {
			NAME: 'slowmode',
			DESCRIPTION: "Définir le mode lent d'un salon.",
			OPTIONS: {
				SECONDS: {
					NAME: 'secondes',
					DESCRIPTION: 'Le délai en secondes (0 pour désactiver).',
				},
				CHANNEL: {
					NAME: 'salon',
					DESCRIPTION: 'Le salon cible (par défaut le salon actuel).',
				},
			},
			SUCCESS_SET: 'Mode lent défini à **{seconds:number}** seconde{{s}} dans {channel:string}.',
			SUCCESS_OFF: 'Mode lent désactivé dans {channel:string}.',
		},
		LOCK: {
			NAME: 'lock',
			DESCRIPTION: 'Verrouiller un salon.',
			OPTIONS: {
				CHANNEL: {
					NAME: 'salon',
					DESCRIPTION: 'Le salon à verrouiller (par défaut le salon actuel).',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: 'La raison du verrouillage.',
				},
			},
			SUCCESS: 'Le salon {channel:string} a été verrouillé.',
		},
		UNLOCK: {
			NAME: 'unlock',
			DESCRIPTION: 'Déverrouiller un salon.',
			OPTIONS: {
				CHANNEL: {
					NAME: 'salon',
					DESCRIPTION: 'Le salon à déverrouiller (par défaut le salon actuel).',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: 'La raison du déverrouillage.',
				},
			},
			SUCCESS: 'Le salon {channel:string} a été déverrouillé.',
		},
		ROLE: {
			NAME: 'role',
			DESCRIPTION: 'Ajouter ou retirer un rôle à un membre.',
			OPTIONS: {
				ACTION: {
					NAME: 'action',
					DESCRIPTION: "L'action à effectuer.",
				},
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre ciblé.',
				},
				ROLE: {
					NAME: 'role',
					DESCRIPTION: 'Le rôle à ajouter ou retirer.',
				},
			},
			CHOICES: {
				ADD: 'Ajouter',
				REMOVE: 'Retirer',
			},
			ERRORS: {
				HIERARCHY: 'Ce rôle est supérieur ou égal au rôle le plus élevé du bot.',
				ALREADY_HAS: '**{member:string}** possède déjà le rôle **{role:string}**.',
				DOES_NOT_HAVE: '**{member:string}** ne possède pas le rôle **{role:string}**.',
			},
			SUCCESS_ADD: 'Le rôle **{role:string}** a été ajouté à **{member:string}**.',
			SUCCESS_REMOVE: 'Le rôle **{role:string}** a été retiré de **{member:string}**.',
		},
		ANNOUNCE: {
			NAME: 'announce',
			DESCRIPTION: 'Envoyer une annonce dans un salon.',
			OPTIONS: {
				CHANNEL: {
					NAME: 'salon',
					DESCRIPTION: "Le salon où envoyer l'annonce.",
				},
				TITLE: {
					NAME: 'titre',
					DESCRIPTION: "Le titre de l'annonce.",
				},
				MESSAGE: {
					NAME: 'message',
					DESCRIPTION: "Le contenu de l'annonce.",
				},
				COLOR: {
					NAME: 'couleur',
					DESCRIPTION: "La couleur de l'embed (ex: #FF0000).",
				},
			},
			SUCCESS: "L'annonce a été envoyée dans {channel:string}.",
		},
		SOFTBAN: {
			NAME: 'softban',
			DESCRIPTION: 'Bannir et débannir immédiatement un membre pour supprimer ses messages.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre à softban.',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: 'La raison du softban.',
				},
				DELETE_MESSAGES: {
					NAME: 'supprimer_messages',
					DESCRIPTION: 'Nombre de jours de messages à supprimer (1-7).',
				},
			},
			SUCCESS: '**{member:string}** a été softbanni du serveur.',
		},
		NUKE: {
			NAME: 'nuke',
			DESCRIPTION: 'Recréer un salon pour effacer tout son historique.',
			OPTIONS: {
				CHANNEL: {
					NAME: 'salon',
					DESCRIPTION: 'Le salon à nuke (par défaut le salon actuel).',
				},
			},
			CONFIRM: 'Êtes-vous sûr de vouloir nuke le salon {channel:string} ? Cette action est irréversible.',
			SUCCESS: 'Le salon a été nuke avec succès par {user:string}.',
		},
		NICK: {
			NAME: 'nick',
			DESCRIPTION: 'Changer le surnom d\'un membre.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre dont changer le surnom.',
				},
				NICKNAME: {
					NAME: 'surnom',
					DESCRIPTION: 'Le nouveau surnom.',
				},
			},
			SUCCESS: 'Le surnom de **{member:string}** a été changé en **{nickname:string}**.',
			RESET: 'Le surnom de **{member:string}** a été réinitialisé.',
		},
		DEAFEN: {
			NAME: 'deafen',
			DESCRIPTION: 'Assourdir un membre dans les salons vocaux.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre à assourdir.',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: 'La raison.',
				},
			},
			SUCCESS: '**{member:string}** a été assourdi.',
		},
		UNDEAFEN: {
			NAME: 'undeafen',
			DESCRIPTION: 'Rétablir l\'ouïe d\'un membre dans les salons vocaux.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre à rétablir.',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: 'La raison.',
				},
			},
			SUCCESS: 'L\'ouïe de **{member:string}** a été rétablie.',
		},
		VMUTE: {
			NAME: 'vmute',
			DESCRIPTION: 'Rendre muet un membre dans les salons vocaux.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre à rendre muet.',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: 'La raison.',
				},
			},
			SUCCESS: '**{member:string}** a été rendu muet dans les salons vocaux.',
		},
		VUNMUTE: {
			NAME: 'vunmute',
			DESCRIPTION: 'Rétablir la parole d\'un membre dans les salons vocaux.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre à rétablir.',
				},
				REASON: {
					NAME: 'raison',
					DESCRIPTION: 'La raison.',
				},
			},
			SUCCESS: 'La parole de **{member:string}** a été rétablie.',
		},
		MODLOGS: {
			NAME: 'modlogs',
			DESCRIPTION: 'Voir l\'historique de modération d\'un membre.',
			OPTIONS: {
				MEMBER: {
					NAME: 'membre',
					DESCRIPTION: 'Le membre dont voir l\'historique.',
				},
			},
			EMBED: {
				TITLE: 'Historique de modération de {member:string}',
				NO_LOGS: 'Aucun log de modération trouvé.',
				LOG_ENTRY: '`{id:number}` **{action:string}** par <@{moderator:string}> le {date:string}\n└ *Raison : {reason:string}*',
			},
		},
	},
} satisfies BaseTranslation

export default fr

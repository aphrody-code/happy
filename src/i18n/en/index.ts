/* eslint-disable */
import type { Translation } from '../i18n-types'

const en = {
	GUARDS: {
		DISABLED_COMMAND: 'This command is currently disabled.',
		MAINTENANCE: 'This bot is currently in maintenance mode.',
		GUILD_ONLY: 'This command can only be used in a server.',
		NSFW: 'This command can only be used in a NSFW channel.',
	},
	ERRORS: {
		UNKNOWN: 'An unknown error occurred.',
	},
	SHARED: {
		NO_COMMAND_DESCRIPTION: 'No description provided.',
	},
	COMMANDS: {
		INVITE: {
			DESCRIPTION: 'Invite the bot to your server!',
			EMBED: {
				TITLE: 'Invite me to your server!',
				DESCRIPTION: '[Click here]({link}) to invite me! Aye Sir!',
			},
		},
		PREFIX: {
			NAME: 'prefix',
			DESCRIPTION: 'Change the prefix of the bot.',
			OPTIONS: {
				PREFIX: {
					NAME: 'new_prefix',
					DESCRIPTION: 'The new prefix of the bot.',
				},
			},
			EMBED: {
				DESCRIPTION: 'Prefix changed to `{prefix}`.',
			},
		},
		MAINTENANCE: {
			DESCRIPTION: 'Set the maintenance mode of the bot.',
			EMBED: {
				DESCRIPTION: 'Maintenance mode set to `{state}`.',
			},
		},
		STATS: {
			DESCRIPTION: 'Get some stats about the bot.',
			HEADERS: {
				COMMANDS: 'Commands',
				GUILDS: 'Guild',
				ACTIVE_USERS: 'Active Users',
				USERS: 'Users',
			},
		},
		HELP: {
			DESCRIPTION: 'Get global help about the bot and its commands',
			EMBED: {
				TITLE: "Happy's Help Panel",
				CATEGORY_TITLE: '{category} Commands',
			},
			SELECT_MENU: {
				TITLE: 'Select a category',
				CATEGORY_DESCRIPTION: '{category} commands',
			},
		},
		PING: {
			DESCRIPTION: 'Aye Sir!',
			MESSAGE: "Aye Sir! {member} Response time was {time}ms. That's as fast as Max Speed!{heartbeat}",
		},
		GUILDE: {
			DESCRIPTION: 'Choose your Fairy Tail guild!',
			EMBED: {
				TITLE: 'Choose your Guild',
				DESCRIPTION: 'Select a guild from the menus below to join it. You can only belong to one guild at a time.',
				LEGAL_LABEL: 'Legal Guilds',
				DARK_LABEL: 'Dark & Independent Guilds',
			},
			ALREADY_IN_GUILD: 'You are already a member of **{guilde}**!',
			SUCCESS: {
				TITLE: 'Welcome to {guilde}!',
				DESCRIPTION: 'You are now a member of **{guilde}**! The role has been assigned.',
			},
			CHANGED: {
				TITLE: 'Guild changed!',
				DESCRIPTION: 'You left **{oldGuilde}** and joined **{newGuilde}**!',
			},
			ERROR: 'An error occurred while assigning the guild.',
		},
		GUILDE_INFO: {
			DESCRIPTION: 'View the member count of each guild.',
			EMBED: {
				TITLE: 'Guild Statistics',
				NO_MEMBERS: 'No members yet',
				MEMBER_COUNT: '{count} member{{s}}',
				LEGAL_TITLE: 'Legal Guilds',
				DARK_TITLE: 'Dark Guilds',
				INDEPENDENT_TITLE: 'Independent Guilds',
			},
		},
		GUILDE_RESET: {
			DESCRIPTION: 'Remove a member from their guild.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member to remove from their guild.',
				},
			},
			SUCCESS: '**{member}** has been removed from **{guilde}**.',
			NOT_IN_GUILD: '**{member}** is not in any guild.',
		},
		GUILDE_RESET_ALL: {
			DESCRIPTION: 'Reset all guild memberships on this server.',
			SUCCESS: 'All guild memberships have been reset ({count} removed).',
			NO_MEMBERSHIPS: 'There are no guild memberships to reset.',
		},
		HAPPY: {
			DESCRIPTION: 'Discover Happy, the winged cat from Fairy Tail!',
			QUOTE_TITLE: 'Happy Quote',
			TRIVIA_TITLE: 'Did you know?',
			WHO_TITLE: 'Who is Happy?',
			RANDOM_TITLE: 'Happy says...',
			OPTIONS: {
				ACTION: {
					NAME: 'action',
					DESCRIPTION: 'What do you want to know about Happy?',
				},
			},
		},
		AVATAR: {
			DESCRIPTION: 'Display a member\'s avatar.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member whose avatar to display.',
				},
			},
			EMBED: {
				TITLE: 'Avatar of {user}',
			},
		},
		USERINFO: {
			DESCRIPTION: 'Display information about a member.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member whose information to display.',
				},
			},
			EMBED: {
				TITLE: 'User Info for {user}',
				FIELDS: {
					ID: 'ID',
					CREATED: 'Account Created',
					JOINED: 'Joined Server',
					ROLES: 'Roles ({count})',
					BADGES: 'Badges',
					STATUS: 'Status',
					BOT: 'Bot',
				},
			},
		},
		SERVERINFO: {
			DESCRIPTION: 'Display server information.',
			EMBED: {
				TITLE: 'Server Info for {guild}',
				FIELDS: {
					OWNER: 'Owner',
					CREATED: 'Created On',
					MEMBERS: 'Members',
					CHANNELS: 'Channels',
					ROLES: 'Roles',
					EMOJIS: 'Emojis',
					BOOSTS: 'Boosts',
					VERIFICATION: 'Verification',
				},
			},
		},
		BANNER: {
			DESCRIPTION: 'Display a member\'s banner.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member whose banner to display.',
				},
			},
			EMBED: {
				TITLE: 'Banner of {user}',
				NO_BANNER: 'This member has no banner.',
			},
		},
		RPG: {
			DESCRIPTION: 'Fairy Tail RPG game engine.',
			EXPLORE_TITLE: 'Exploring {location}',
			STATS_TITLE: "{user}'s RPG Profile",
			MOVE_SUCCESS: 'You move to {location}.',
			NPC_HEADER: 'Characters present',
			ITEM_HEADER: 'Items found',
			CONNECTION_HEADER: 'Accessible locations',
			LEVEL: 'Level {level}',
			XP: 'Experience: {xp}',
			JEWELS: 'Jewels: {jewels}',
			HP: 'HP: {hp}/{maxHp}',
			MP: 'MP: {mp}/{maxMp}',
			OPTIONS: {
				SUB: {
					EXPLORE: 'Explore the current location.',
					MOVE: 'Move to another location.',
					TALK: 'Talk to a character.',
					PROFILE: 'View your RPG profile.',
				},
				LOCATION: 'The location to go to.',
				NPC: 'The character to talk to.',
			},
		},
		BAN: {
			NAME: 'ban',
			DESCRIPTION: 'Ban a member from the server.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member to ban.',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason for the ban.',
				},
				DELETE_MESSAGES: {
					NAME: 'delete_messages',
					DESCRIPTION: 'Number of days of messages to delete (0-7).',
				},
			},
			ERRORS: {
				SELF: 'You cannot ban yourself.',
				BOT: 'I cannot ban myself.',
				OWNER: 'You cannot ban the server owner.',
				HIERARCHY: 'You cannot ban a member with a higher or equal role.',
				NOT_BANNABLE: 'I do not have permission to ban this member.',
			},
			SUCCESS: '**{member}** has been banned from the server.',
		},
		UNBAN: {
			NAME: 'unban',
			DESCRIPTION: 'Unban a user from the server.',
			OPTIONS: {
				USER_ID: {
					NAME: 'user_id',
					DESCRIPTION: 'The ID of the user to unban.',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason for the unban.',
				},
			},
			ERRORS: {
				NOT_BANNED: 'This user is not banned.',
				INVALID_ID: 'Invalid user ID.',
			},
			SUCCESS: 'User **{user}** has been unbanned.',
		},
		KICK: {
			NAME: 'kick',
			DESCRIPTION: 'Kick a member from the server.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member to kick.',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason for the kick.',
				},
			},
			ERRORS: {
				SELF: 'You cannot kick yourself.',
				BOT: 'I cannot kick myself.',
				OWNER: 'You cannot kick the server owner.',
				HIERARCHY: 'You cannot kick a member with a higher or equal role.',
				NOT_KICKABLE: 'I do not have permission to kick this member.',
			},
			SUCCESS: '**{member}** has been kicked from the server.',
		},
		TIMEOUT: {
			NAME: 'timeout',
			DESCRIPTION: 'Temporarily mute a member.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member to timeout.',
				},
				DURATION: {
					NAME: 'duration',
					DESCRIPTION: 'The duration in minutes.',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason for the timeout.',
				},
			},
			ERRORS: {
				SELF: 'You cannot timeout yourself.',
				BOT: 'I cannot timeout myself.',
				OWNER: 'You cannot timeout the server owner.',
				HIERARCHY: 'You cannot timeout a member with a higher or equal role.',
				NOT_MODERATABLE: 'I do not have permission to moderate this member.',
			},
			SUCCESS: '**{member}** has been timed out for **{duration}** minute{{s}}.',
		},
		UNTIMEOUT: {
			NAME: 'untimeout',
			DESCRIPTION: 'Remove timeout from a member.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member to untimeout.',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason for removing the timeout.',
				},
			},
			ERRORS: {
				NOT_TIMED_OUT: 'This member is not timed out.',
				NOT_MODERATABLE: 'I do not have permission to moderate this member.',
			},
			SUCCESS: 'Timeout has been removed from **{member}**.',
		},
		WARN: {
			NAME: 'warn',
			DESCRIPTION: 'Warn a member.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member to warn.',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason for the warning.',
				},
			},
			SUCCESS: '**{member}** has been warned. Active total: **{count}**.',
		},
		WARNINGS: {
			NAME: 'warnings',
			DESCRIPTION: "View or clear a member's warnings.",
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member whose warnings to view.',
				},
				ACTION: {
					NAME: 'action',
					DESCRIPTION: 'The action to perform.',
				},
			},
			CHOICES: {
				VIEW: 'View',
				CLEAR: 'Clear',
			},
			EMBED: {
				TITLE: "{member}'s Warnings",
				NO_WARNINGS: 'No active warnings.',
				WARNING_ENTRY: '#{id} - by <@{moderator}> on {date}: {reason}',
			},
			CLEARED: 'All warnings for **{member}** have been cleared ({count} removed).',
		},
		CLEAR: {
			NAME: 'clear',
			DESCRIPTION: 'Bulk delete messages.',
			OPTIONS: {
				COUNT: {
					NAME: 'count',
					DESCRIPTION: 'The number of messages to delete (1-100).',
				},
				USER: {
					NAME: 'user',
					DESCRIPTION: 'Filter by user.',
				},
				BOTS_ONLY: {
					NAME: 'bots_only',
					DESCRIPTION: 'Only delete bot messages.',
				},
				CONTAINS: {
					NAME: 'contains',
					DESCRIPTION: 'Only delete messages containing this text.',
				},
			},
			ERRORS: {
				NO_MESSAGES: 'No matching messages found.',
			},
			SUCCESS: '**{count}** message{{s}} deleted.',
		},
		SLOWMODE: {
			NAME: 'slowmode',
			DESCRIPTION: "Set a channel's slowmode.",
			OPTIONS: {
				SECONDS: {
					NAME: 'seconds',
					DESCRIPTION: 'The delay in seconds (0 to disable).',
				},
				CHANNEL: {
					NAME: 'channel',
					DESCRIPTION: 'The target channel (defaults to current).',
				},
			},
			SUCCESS_SET: 'Slowmode set to **{seconds}** second{{s}} in {channel}.',
			SUCCESS_OFF: 'Slowmode disabled in {channel}.',
		},
		LOCK: {
			NAME: 'lock',
			DESCRIPTION: 'Lock a channel.',
			OPTIONS: {
				CHANNEL: {
					NAME: 'channel',
					DESCRIPTION: 'The channel to lock (defaults to current).',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason for locking.',
				},
			},
			SUCCESS: 'Channel {channel} has been locked.',
		},
		UNLOCK: {
			NAME: 'unlock',
			DESCRIPTION: 'Unlock a channel.',
			OPTIONS: {
				CHANNEL: {
					NAME: 'channel',
					DESCRIPTION: 'The channel to unlock (defaults to current).',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason for unlocking.',
				},
			},
			SUCCESS: 'Channel {channel} has been unlocked.',
		},
		ROLE: {
			NAME: 'role',
			DESCRIPTION: 'Add or remove a role from a member.',
			OPTIONS: {
				ACTION: {
					NAME: 'action',
					DESCRIPTION: 'The action to perform.',
				},
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The target member.',
				},
				ROLE: {
					NAME: 'role',
					DESCRIPTION: 'The role to add or remove.',
				},
			},
			CHOICES: {
				ADD: 'Add',
				REMOVE: 'Remove',
			},
			ERRORS: {
				HIERARCHY: "This role is higher or equal to the bot's highest role.",
				ALREADY_HAS: '**{member}** already has the role **{role}**.',
				DOES_NOT_HAVE: '**{member}** does not have the role **{role}**.',
			},
			SUCCESS_ADD: 'Role **{role}** has been added to **{member}**.',
			SUCCESS_REMOVE: 'Role **{role}** has been removed from **{member}**.',
		},
		ANNOUNCE: {
			NAME: 'announce',
			DESCRIPTION: 'Send an announcement to a channel.',
			OPTIONS: {
				CHANNEL: {
					NAME: 'channel',
					DESCRIPTION: 'The channel to send the announcement to.',
				},
				TITLE: {
					NAME: 'title',
					DESCRIPTION: 'The announcement title.',
				},
				MESSAGE: {
					NAME: 'message',
					DESCRIPTION: 'The announcement content.',
				},
				COLOR: {
					NAME: 'color',
					DESCRIPTION: 'The embed color (e.g. #FF0000).',
				},
			},
			SUCCESS: 'Announcement sent to {channel}.',
		},
		SOFTBAN: {
			NAME: 'softban',
			DESCRIPTION: 'Ban and immediately unban a member to delete their messages.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member to softban.',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason for the softban.',
				},
				DELETE_MESSAGES: {
					NAME: 'delete_messages',
					DESCRIPTION: 'Number of days of messages to delete (1-7).',
				},
			},
			SUCCESS: '**{member}** has been softbanned from the server.',
		},
		NUKE: {
			NAME: 'nuke',
			DESCRIPTION: 'Recreate a channel to clear all its history.',
			OPTIONS: {
				CHANNEL: {
					NAME: 'channel',
					DESCRIPTION: 'The channel to nuke (defaults to current).',
				},
			},
			CONFIRM: 'Are you sure you want to nuke the channel {channel}? This action is irreversible.',
			SUCCESS: 'The channel has been successfully nuked by {user}.',
		},
		NICK: {
			NAME: 'nick',
			DESCRIPTION: 'Change a member\'s nickname.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member whose nickname to change.',
				},
				NICKNAME: {
					NAME: 'nickname',
					DESCRIPTION: 'The new nickname.',
				},
			},
			SUCCESS: '**{member}\'s** nickname has been changed to **{nickname}**.',
			RESET: '**{member}\'s** nickname has been reset.',
		},
		DEAFEN: {
			NAME: 'deafen',
			DESCRIPTION: 'Deafen a member in voice channels.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member to deafen.',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason.',
				},
			},
			SUCCESS: '**{member}** has been deafened.',
		},
		UNDEAFEN: {
			NAME: 'undeafen',
			DESCRIPTION: 'Undeafen a member in voice channels.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member to undeafen.',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason.',
				},
			},
			SUCCESS: '**{member}** has been undeafened.',
		},
		VMUTE: {
			NAME: 'vmute',
			DESCRIPTION: 'Mute a member in voice channels.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member to mute.',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason.',
				},
			},
			SUCCESS: '**{member}** has been muted in voice channels.',
		},
		VUNMUTE: {
			NAME: 'vunmute',
			DESCRIPTION: 'Unmute a member in voice channels.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member to unmute.',
				},
				REASON: {
					NAME: 'reason',
					DESCRIPTION: 'The reason.',
				},
			},
			SUCCESS: '**{member}** has been unmuted.',
		},
		MODLOGS: {
			NAME: 'modlogs',
			DESCRIPTION: 'View a member\'s moderation history.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'The member whose history to view.',
				},
			},
			EMBED: {
				TITLE: 'Moderation History for {member}',
				NO_LOGS: 'No moderation logs found.',
				LOG_ENTRY: '`{id}` **{action}** by <@{moderator}> on {date}\n└ *Reason: {reason}*',
			},
		},
	},
} satisfies Translation

export default en

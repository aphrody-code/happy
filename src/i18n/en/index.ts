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
				TITLE: 'Invite me on your server!',
				DESCRIPTION: '[Click here]({link}) to invite me!',
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
				TITLE: 'Help panel',
				CATEGORY_TITLE: '{category} Commands',
			},
			SELECT_MENU: {
				TITLE: 'Select a category',
				CATEGORY_DESCRIPTION: '{category} commands',
			},
		},
		PING: {
			DESCRIPTION: 'Pong!',
			MESSAGE: '{member} Pong! The message round-trip took {time}ms.{heartbeat}',
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
		SETUP: {
			DESCRIPTION: 'Set up all server channels and categories.',
			EMBED: {
				TITLE: 'Server Setup',
				PROGRESS: 'Setting up channels and categories, please wait...',
				DONE_TITLE: 'Setup Complete!',
				DONE_DESCRIPTION: 'Created **{categories}** categories and **{channels}** channels ({skipped} skipped).',
			},
		},
	},
} satisfies Translation

export default en

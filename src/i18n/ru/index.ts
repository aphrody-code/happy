/* eslint-disable */
import type { Translation } from '../i18n-types'

const ru = {
	GUARDS: {
		DISABLED_COMMAND: 'Эта команда на данный момент не доступна.',
		MAINTENANCE: 'Бот закрыт на техническое обслуживание.',
		GUILD_ONLY: 'Эту команду можно использовать только на сервере.',
		NSFW: 'Эта команда доступна только в чатах 18+.',
	},
	ERRORS: {
		UNKNOWN: 'Произошла непонятная ошибка.',
	},
	SHARED: {
		NO_COMMAND_DESCRIPTION: 'Описание отсутствует.',
	},
	COMMANDS: {
		INVITE: {
			DESCRIPTION: 'Пригласить бота на свой сервер!',
			EMBED: {
				TITLE: 'Хочешь видеть меня у себя на сервере?',
				DESCRIPTION: '[Жми здесь]({link}) чтобы добавить бота!',
			},
		},
		PREFIX: {
			NAME: 'prefix',
			DESCRIPTION: 'Изменить префикс для бота.',
			OPTIONS: {
				PREFIX: {
					NAME: 'new_prefix',
					DESCRIPTION: 'Новый префикс для бота.',
				},
			},
			EMBED: {
				DESCRIPTION: 'Префикс бота изменен на `{prefix}`.',
			},
		},
		MAINTENANCE: {
			DESCRIPTION: 'Установить режим технического обслуживания бота.',
			EMBED: {
				DESCRIPTION: 'Режим Технического Обслуживания установлен на `{state}`.',
			},
		},
		STATS: {
			DESCRIPTION: 'Получить статистику по боту.',
			HEADERS: {
				COMMANDS: 'Команды',
				GUILDS: 'Сервера',
				ACTIVE_USERS: 'Активные пользователи',
				USERS: 'Пользователи',
			},
		},
		HELP: {
			DESCRIPTION: 'Глобальная справка по боту и его командам',
			EMBED: {
				TITLE: 'Панель помощи',
				CATEGORY_TITLE: '{category} команды',
			},
			SELECT_MENU: {
				TITLE: 'Выбери категорию',
				CATEGORY_DESCRIPTION: '{category} команды',
			},
		},
		PING: {
			DESCRIPTION: 'Тук-тук!',
			MESSAGE: '{member} Что нужно? Было потрачено {time} милисекунд на генерацию ответа. {heartbeat}',
		},
		GUILDE: {
			DESCRIPTION: 'Выбери свою гильдию Fairy Tail!',
			EMBED: {
				TITLE: 'Выбери свою Гильдию',
				DESCRIPTION: 'Выбери гильдию из меню ниже, чтобы присоединиться. Ты можешь состоять только в одной гильдии.',
				LEGAL_LABEL: 'Легальные Гильдии',
				DARK_LABEL: 'Тёмные и Независимые Гильдии',
			},
			ALREADY_IN_GUILD: 'Ты уже состоишь в **{guilde}**!',
			SUCCESS: {
				TITLE: 'Добро пожаловать в {guilde}!',
				DESCRIPTION: 'Ты теперь член **{guilde}**! Роль присвоена.',
			},
			CHANGED: {
				TITLE: 'Гильдия изменена!',
				DESCRIPTION: 'Ты покинул **{oldGuilde}** и присоединился к **{newGuilde}**!',
			},
			ERROR: 'Произошла ошибка при назначении гильдии.',
		},
		GUILDE_INFO: {
			DESCRIPTION: 'Посмотреть количество членов каждой гильдии.',
			EMBED: {
				TITLE: 'Статистика Гильдий',
				NO_MEMBERS: 'Пока нет членов',
				MEMBER_COUNT: '{count} член{{ов}}',
				LEGAL_TITLE: 'Легальные Гильдии',
				DARK_TITLE: 'Тёмные Гильдии',
				INDEPENDENT_TITLE: 'Независимые Гильдии',
			},
		},
		GUILDE_RESET: {
			DESCRIPTION: 'Удалить участника из его гильдии.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'Участник для удаления из гильдии.',
				},
			},
			SUCCESS: '**{member}** удалён из **{guilde}**.',
			NOT_IN_GUILD: '**{member}** не состоит ни в одной гильдии.',
		},
		GUILDE_RESET_ALL: {
			DESCRIPTION: 'Сбросить все гильдии на сервере.',
			SUCCESS: 'Все гильдии сброшены ({count} удалено).',
			NO_MEMBERSHIPS: 'Нет членств в гильдиях для сброса.',
		},
		SETUP: {
			DESCRIPTION: 'Настроить все каналы и категории сервера.',
			EMBED: {
				TITLE: 'Настройка сервера',
				PROGRESS: 'Создание каналов и категорий, пожалуйста подождите...',
				DONE_TITLE: 'Настройка завершена!',
				DONE_DESCRIPTION: 'Создано **{categories}** категорий и **{channels}** каналов ({skipped} пропущено).',
			},
		},
	},
} satisfies Translation

export default ru

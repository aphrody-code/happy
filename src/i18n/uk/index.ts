/* eslint-disable */
import type { Translation } from '../i18n-types'

const uk = {
	GUARDS: {
		DISABLED_COMMAND: 'Ця команда на разі відключена',
		MAINTENANCE: 'На разі ведуться технічні роботи!',
		GUILD_ONLY: 'Цю команду можна використовувати тільки на сервері!',
		NSFW: 'Ця команда може бути використана тільки в каналі для дорослих!',
	},
	ERRORS: {
		UNKNOWN: 'Сталася невідома помилка!',
	},
	SHARED: {
		NO_COMMAND_DESCRIPTION: 'Опис відсутній.',
	},
	COMMANDS: {
		INVITE: {
			DESCRIPTION: 'Запросити бота до себе додому!',
			EMBED: {
				TITLE: 'Запроси мене до себе на сервер!',
				DESCRIPTION: '[Тисни тут]({link}) щоб я мав доступ!',
			},
		},
		PREFIX: {
			NAME: 'prefix',
			DESCRIPTION: 'Змінити префікс команд.',
			OPTIONS: {
				PREFIX: {
					NAME: 'new_prefix',
					DESCRIPTION: 'Новий префікс для команд боту.',
				},
			},
			EMBED: {
				DESCRIPTION: 'Префікс змінено на `{prefix}`.',
			},
		},
		MAINTENANCE: {
			DESCRIPTION: 'Встановити режим проведення технічних робіт.',
			EMBED: {
				DESCRIPTION: 'Режим технічних робіт встановлено на `{state}`.',
			},
		},
		STATS: {
			DESCRIPTION: 'Подивитись статистику бота.',
			HEADERS: {
				COMMANDS: 'Команди',
				GUILDS: 'Гільдії',
				ACTIVE_USERS: 'Активні користувачі',
				USERS: 'Користувачі',
			},
		},
		HELP: {
			DESCRIPTION: 'Загальна допомога по боту та його командам',
			EMBED: {
				TITLE: 'Панель допомоги',
				CATEGORY_TITLE: '{category} команди',
			},
			SELECT_MENU: {
				TITLE: 'Вибери категорію',
				CATEGORY_DESCRIPTION: '{category} команди',
			},
		},
		PING: {
			DESCRIPTION: "Перевірка зв'язку!",
			MESSAGE: '{member} Чути добре! Генерація повідомлення зайняла {time} мілісекунд. {heartbeat}',
		},
		GUILDE: {
			DESCRIPTION: 'Обери свою гільдію Fairy Tail!',
			EMBED: {
				TITLE: 'Обери свою Гільдію',
				DESCRIPTION: 'Обери гільдію з меню нижче, щоб приєднатися. Ти можеш бути лише в одній гільдії.',
				LEGAL_LABEL: 'Легальні Гільдії',
				DARK_LABEL: 'Темні та Незалежні Гільдії',
			},
			ALREADY_IN_GUILD: 'Ти вже є членом **{guilde}**!',
			SUCCESS: {
				TITLE: 'Ласкаво просимо до {guilde}!',
				DESCRIPTION: 'Тепер ти член **{guilde}**! Роль призначена.',
			},
			CHANGED: {
				TITLE: 'Гільдію змінено!',
				DESCRIPTION: 'Ти покинув **{oldGuilde}** та приєднався до **{newGuilde}**!',
			},
			ERROR: 'Сталася помилка при призначенні гільдії.',
		},
		GUILDE_INFO: {
			DESCRIPTION: 'Переглянути кількість членів кожної гільдії.',
			EMBED: {
				TITLE: 'Статистика Гільдій',
				NO_MEMBERS: 'Поки що немає членів',
				MEMBER_COUNT: '{count} член{{ів}}',
				LEGAL_TITLE: 'Легальні Гільдії',
				DARK_TITLE: 'Темні Гільдії',
				INDEPENDENT_TITLE: 'Незалежні Гільдії',
			},
		},
		GUILDE_RESET: {
			DESCRIPTION: 'Видалити учасника з його гільдії.',
			OPTIONS: {
				MEMBER: {
					NAME: 'member',
					DESCRIPTION: 'Учасник для видалення з гільдії.',
				},
			},
			SUCCESS: '**{member}** видалено з **{guilde}**.',
			NOT_IN_GUILD: '**{member}** не є членом жодної гільдії.',
		},
		GUILDE_RESET_ALL: {
			DESCRIPTION: 'Скинути всі гільдії на сервері.',
			SUCCESS: 'Усі гільдії скинуто ({count} видалено).',
			NO_MEMBERSHIPS: 'Немає членств у гільдіях для скидання.',
		},
		SETUP: {
			DESCRIPTION: 'Налаштувати всі канали та категорії сервера.',
			EMBED: {
				TITLE: 'Налаштування сервера',
				PROGRESS: 'Створення каналів та категорій, будь ласка зачекайте...',
				DONE_TITLE: 'Налаштування завершено!',
				DONE_DESCRIPTION: 'Створено **{categories}** категорій та **{channels}** каналів ({skipped} пропущено).',
			},
		},
	},
} satisfies Translation

export default uk

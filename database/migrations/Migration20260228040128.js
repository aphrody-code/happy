'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { Migration } = require('@mikro-orm/migrations')

class Migration20260228040128 extends Migration {

	async up() {
		this.addSql(`create table \`rpgplayer\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`user_id\` text not null, \`discord_guild_id\` text not null, \`level\` integer not null default 1, \`xp\` integer not null default 0, \`jewels\` integer not null default 100, \`hp\` integer not null default 100, \`max_hp\` integer not null default 100, \`mp\` integer not null default 50, \`max_mp\` integer not null default 50, \`current_location\` text not null default 'magnolia', \`context\` text not null default 'exploration');`)
		this.addSql(`create index \`rpgplayer_user_id_index\` on \`rpgplayer\` (\`user_id\`);`)
		this.addSql(`create index \`rpgplayer_discord_guild_id_index\` on \`rpgplayer\` (\`discord_guild_id\`);`)

		this.addSql(`create table \`rpgnarrative_state\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`flag\` text not null, \`value\` json not null, \`player_id\` integer not null, constraint \`rpgnarrative_state_player_id_foreign\` foreign key(\`player_id\`) references \`rpgplayer\`(\`id\`) on update cascade);`)
		this.addSql(`create index \`rpgnarrative_state_player_id_index\` on \`rpgnarrative_state\` (\`player_id\`);`)
		this.addSql(`create unique index \`rpgnarrative_state_player_id_flag_unique\` on \`rpgnarrative_state\` (\`player_id\`, \`flag\`);`)

		this.addSql(`create table \`rpgitem\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`item_id\` text not null, \`name\` text not null, \`quantity\` integer not null default 1, \`metadata\` json null, \`player_id\` integer not null, constraint \`rpgitem_player_id_foreign\` foreign key(\`player_id\`) references \`rpgplayer\`(\`id\`) on update cascade);`)
		this.addSql(`create index \`rpgitem_player_id_index\` on \`rpgitem\` (\`player_id\`);`)

		this.addSql(`create table \`rpgquest\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`quest_id\` text not null, \`status\` text not null default 'active', \`current_step\` integer not null default 0, \`data\` json null, \`player_id\` integer not null, constraint \`rpgquest_player_id_foreign\` foreign key(\`player_id\`) references \`rpgplayer\`(\`id\`) on update cascade);`)
		this.addSql(`create index \`rpgquest_player_id_index\` on \`rpgquest\` (\`player_id\`);`)

		this.addSql(`create table \`star_board\` (\`guild_id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`channel_id\` text not null, \`emoji\` text not null default '⭐', \`min_star\` integer not null default 3, primary key (\`guild_id\`));`)

		this.addSql(`create table \`star_board_message\` (\`src_message\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`starboard_message\` text not null, \`starboard_channel\` text null, \`star_count\` integer not null, \`starboard_guild_id\` text not null, constraint \`star_board_message_starboard_guild_id_foreign\` foreign key(\`starboard_guild_id\`) references \`star_board\`(\`guild_id\`) on update cascade, primary key (\`src_message\`));`)
		this.addSql(`create index \`star_board_message_starboard_guild_id_index\` on \`star_board_message\` (\`starboard_guild_id\`);`)

		this.addSql(`create index \`fairy_tail_guilde_discord_guild_id_index\` on \`fairy_tail_guilde\` (\`discord_guild_id\`);`)
		this.addSql(`create index \`fairy_tail_guilde_user_id_index\` on \`fairy_tail_guilde\` (\`user_id\`);`)
		this.addSql(`create unique index \`fairy_tail_guilde_discord_guild_id_user_id_unique\` on \`fairy_tail_guilde\` (\`discord_guild_id\`, \`user_id\`);`)

		this.addSql(`create index \`stat_type_index\` on \`stat\` (\`type\`);`)
		this.addSql(`create index \`stat_created_at_index\` on \`stat\` (\`created_at\`);`)
		this.addSql(`create index \`stat_type_created_at_index\` on \`stat\` (\`type\`, \`created_at\`);`)
	}

}
exports.Migration20260228040128 = Migration20260228040128

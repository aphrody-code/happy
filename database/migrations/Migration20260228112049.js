'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { Migration } = require('@mikro-orm/migrations')

class Migration20260228112049 extends Migration {

	async up() {
		this.addSql(`create table \`poll\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`title\` text not null, \`description\` text null, \`is_active\` integer not null default true, \`guild_id\` text not null, \`creator_id\` text not null);`)

		this.addSql(`create table \`poll_option\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`label\` text not null, \`poll_id\` integer not null, constraint \`poll_option_poll_id_foreign\` foreign key(\`poll_id\`) references \`poll\`(\`id\`) on update cascade);`)
		this.addSql(`create index \`poll_option_poll_id_index\` on \`poll_option\` (\`poll_id\`);`)

		this.addSql(`create table \`poll_vote\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`user_id\` text not null, \`poll_id\` integer not null, \`option_id\` integer not null, constraint \`poll_vote_poll_id_foreign\` foreign key(\`poll_id\`) references \`poll\`(\`id\`) on update cascade, constraint \`poll_vote_option_id_foreign\` foreign key(\`option_id\`) references \`poll_option\`(\`id\`) on update cascade);`)
		this.addSql(`create index \`poll_vote_poll_id_index\` on \`poll_vote\` (\`poll_id\`);`)
		this.addSql(`create index \`poll_vote_option_id_index\` on \`poll_vote\` (\`option_id\`);`)

		this.addSql(`pragma foreign_keys = off;`)
		this.addSql(`create table \`moderation_log__temp_alter\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`discord_guild_id\` text not null, \`action\` text check (\`action\` in ('ban', 'unban', 'kick', 'timeout', 'untimeout', 'warn', 'clear', 'slowmode', 'lock', 'unlock', 'role_add', 'role_remove', 'softban', 'nuke', 'nickname', 'deafen', 'undeafen', 'vmute', 'vunmute')) not null, \`moderator_id\` text not null, \`target_id\` text not null, \`reason\` text null, \`duration\` integer null, \`additional_data\` json null);`)
		this.addSql(`insert into \`moderation_log__temp_alter\` select * from \`moderation_log\`;`)
		this.addSql(`drop table \`moderation_log\`;`)
		this.addSql(`alter table \`moderation_log__temp_alter\` rename to \`moderation_log\`;`)
		this.addSql(`create index \`moderation_log_discord_guild_id_index\` on \`moderation_log\` (\`discord_guild_id\`);`)
		this.addSql(`create index \`moderation_log_moderator_id_index\` on \`moderation_log\` (\`moderator_id\`);`)
		this.addSql(`create index \`moderation_log_target_id_index\` on \`moderation_log\` (\`target_id\`);`)
		this.addSql(`pragma foreign_keys = on;`)
		this.addSql(`alter table \`rpgplayer\` add column \`last_daily\` datetime null;`)
		this.addSql(`alter table \`rpgplayer\` add column \`daily_streak\` integer not null default 0;`)
		this.addSql(`alter table \`rpgplayer\` add column \`last_xp_gain\` datetime null;`)
	}

}
exports.Migration20260228112049 = Migration20260228112049

'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { Migration } = require('@mikro-orm/migrations')

class Migration20260228065958 extends Migration {

	async up() {
		this.addSql(`create table \`moderation_log\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`discord_guild_id\` text not null, \`action\` text check (\`action\` in ('ban', 'unban', 'kick', 'timeout', 'untimeout', 'warn', 'clear', 'slowmode', 'lock', 'unlock', 'role_add', 'role_remove')) not null, \`moderator_id\` text not null, \`target_id\` text not null, \`reason\` text null, \`duration\` integer null, \`additional_data\` json null);`)
		this.addSql(`create index \`moderation_log_discord_guild_id_index\` on \`moderation_log\` (\`discord_guild_id\`);`)
		this.addSql(`create index \`moderation_log_moderator_id_index\` on \`moderation_log\` (\`moderator_id\`);`)
		this.addSql(`create index \`moderation_log_target_id_index\` on \`moderation_log\` (\`target_id\`);`)

		this.addSql(`create table \`warning\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`discord_guild_id\` text not null, \`user_id\` text not null, \`moderator_id\` text not null, \`reason\` text not null, \`active\` integer not null default true);`)
		this.addSql(`create index \`warning_discord_guild_id_index\` on \`warning\` (\`discord_guild_id\`);`)
		this.addSql(`create index \`warning_user_id_index\` on \`warning\` (\`user_id\`);`)
	}

}
exports.Migration20260228065958 = Migration20260228065958

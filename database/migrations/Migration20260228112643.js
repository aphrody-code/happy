'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { Migration } = require('@mikro-orm/migrations')

class Migration20260228112643 extends Migration {

	async up() {
		this.addSql(`alter table \`poll\` add column \`allow_multiple\` integer not null default false;`)
		this.addSql(`alter table \`poll\` add column \`max_votes\` integer not null default 1;`)
	}

}
exports.Migration20260228112643 = Migration20260228112643

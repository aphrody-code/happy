'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { Migration } = require('@mikro-orm/migrations')

class Migration20260228112741 extends Migration {

	async up() {
		this.addSql(`alter table \`poll\` add column \`expires_at\` datetime null;`)
	}

}
exports.Migration20260228112741 = Migration20260228112741

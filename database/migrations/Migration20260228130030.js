'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20260228130030 extends Migration {

  async up() {
    this.addSql(`create unique index \`poll_vote_poll_id_user_id_option_id_unique\` on \`poll_vote\` (\`poll_id\`, \`user_id\`, \`option_id\`);`);
  }

}
exports.Migration20260228130030 = Migration20260228130030;

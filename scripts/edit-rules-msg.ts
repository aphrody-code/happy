import 'dotenv/config'

import { ChannelType, Client, GatewayIntentBits, TextChannel } from 'discord.js'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] })
const GUILD_ID = process.env.TEST_GUILD_ID!
const MSG_ID = '1477166120657227937'

client.once('ready', async () => {
	try {
		const guild = await client.guilds.fetch(GUILD_ID)
		const channels = await guild.channels.fetch()

		for (const [, ch] of channels) {
			if (!ch || ch.type !== ChannelType.GuildText) continue
			const tc = ch as TextChannel
			try {
				const msg = await tc.messages.fetch(MSG_ID)
				if (msg) {
					console.log(`Message trouvé dans #${tc.name}`)
					console.log(`Contenu actuel: ${msg.content.substring(0, 100)}...`)

					const rulesText = [
						'# Règlement de Fairy Tail FR',
						'',
						'T\'es chez Fairy Tail maintenant. C\'est pas juste un serveur, c\'est une famille — bruyante, chaotique, mais soudée. Y\'a quand même quelques règles à respecter.',
						'',
						'### Condition d\'accès',
						'**Ce serveur est réservé aux personnes majeures (18 ans et plus).** En restant sur ce serveur, tu confirmes avoir au moins 18 ans. Tout membre mineur sera exclu sans exception.',
						'',
						'### Les 3 lois du Serment d\'Adieu',
						'*Quand un membre quitte la guilde, ces règles restent. Les trahir c\'est trahir Fairy Tail.*',
						'**1.** Ne révèle jamais d\'infos qui pourraient nuire à la guilde. Ce qui se passe à Magnolia reste à Magnolia.',
						'**2.** Ne détourne pas les membres ou les projets de la guilde pour ton propre compte.',
						'**3.** Ne baisse jamais les bras. Garde foi en toi-même. Ta vie est précieuse — et n\'oublie jamais ceux qui te sont chers.',
						'',
						'### La philosophie du Maître',
						'**Liberté** — La magie et la parole sont des expressions de soi. Débats, créativité, tout ça c\'est encouragé tant que ça reste respectueux.',
						'**Famille** — « Les larmes d\'un seul sont les larmes de tous. » L\'entraide c\'est pas optionnel. Harcèlement, insultes, comportements toxiques → exclusion immédiate.',
						'**Droit à l\'erreur** — Tout le monde peut racheter son passé ici. Mais une fois membre, tu représentes l\'honneur de la marque que tu portes.',
						'',
						'---',
						'En restant ici, tu acceptes ces règles. Maintenant va prendre une mission au tableau et fais honneur à Fairy Tail. **Aye !**',
					].join('\n')

					await msg.edit({ content: rulesText })
					console.log('✅ Message modifié !')
					break
				}
			} catch { /* pas dans ce salon */ }
		}
	} catch (err) {
		console.error('Erreur:', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

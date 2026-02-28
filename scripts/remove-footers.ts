import 'dotenv/config'
import {
	ChannelType,
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	TextChannel,
} from 'discord.js'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] })
const GUILD_ID = process.env.TEST_GUILD_ID!

async function sleep(ms: number) {
	return new Promise(r => setTimeout(r, ms))
}

client.once('ready', async () => {
	console.log(`Bot connecté : ${client.user!.tag}`)

	try {
		const guild = await client.guilds.fetch(GUILD_ID)
		const channels = await guild.channels.fetch()
		let count = 0

		for (const [, ch] of channels) {
			if (!ch || ch.type !== ChannelType.GuildText) continue
			const tc = ch as TextChannel

			const messages = await tc.messages.fetch({ limit: 10 }).catch(() => null)
			if (!messages) continue

			for (const [, msg] of messages) {
				if (msg.author.id !== client.user!.id) continue
				if (msg.embeds.length === 0) continue

				// Vérifier si un embed a un footer contenant "Happy"
				const hasHappyFooter = msg.embeds.some(e =>
					e.footer?.text?.includes('Happy')
				)
				if (!hasHappyFooter) continue

				// Reconstruire les embeds sans footer
				const newEmbeds = msg.embeds.map(e => {
					const eb = new EmbedBuilder()
					if (e.title) eb.setTitle(e.title)
					if (e.description) eb.setDescription(e.description)
					if (e.color !== null) eb.setColor(e.color)
					if (e.image?.url) eb.setImage(e.image.url)
					if (e.thumbnail?.url) eb.setThumbnail(e.thumbnail.url)
					if (e.fields.length > 0) eb.addFields(e.fields)
					// PAS de footer
					return eb
				})

				try {
					await msg.edit({ embeds: newEmbeds })
					count++
					console.log(`  ✅ #${tc.name} (${msg.id})`)
				} catch (err: any) {
					console.error(`  ❌ #${tc.name} (${msg.id}): ${err.message}`)
				}
				await sleep(300)
			}
		}

		console.log(`\n✅ ${count} messages avec footer "Happy 🐟" nettoyés`)
	} catch (err) {
		console.error('Erreur:', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

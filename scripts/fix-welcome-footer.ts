import 'dotenv/config'
import {
	ChannelType,
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	type Message,
	TextChannel,
} from 'discord.js'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] })
const GUILD_ID = process.env.TEST_GUILD_ID!

client.once('ready', async () => {
	try {
		const guild = await client.guilds.fetch(GUILD_ID)
		const channels = await guild.channels.fetch()
		const bienvenue = [...channels.values()].find(
			c => c?.name.includes('bienvenue') && c.type === ChannelType.GuildText
		) as TextChannel | undefined

		if (!bienvenue) { console.log('❌ #bienvenue introuvable'); return }

		const msgs: Message[] = []
		const batch = await bienvenue.messages.fetch({ limit: 20 })
		for (const [, m] of batch) {
			if (m.author.id === client.user!.id) msgs.push(m)
		}

		for (const msg of msgs) {
			for (const embed of msg.embeds) {
				if (embed.description?.includes('Happy 🐟')) {
					const newDesc = embed.description.replace('— Happy 🐟', '').trim()
					const newEmbeds = msg.embeds.map(e => {
						const eb = new EmbedBuilder()
						if (e.title) eb.setTitle(e.title)
						if (e.description) {
							eb.setDescription(e.description.includes('Happy 🐟')
								? e.description.replace('— Happy 🐟', '').trim()
								: e.description)
						}
						if (e.color !== null) eb.setColor(e.color)
						if (e.image?.url) eb.setImage(e.image.url)
						if (e.thumbnail?.url) eb.setThumbnail(e.thumbnail.url)
						if (e.fields.length > 0) eb.addFields(e.fields)
						return eb
					})
					await msg.edit({ embeds: newEmbeds })
					console.log(`✅ Footer "Happy 🐟" retiré du message ${msg.id}`)
				}
			}
		}

		console.log('Done')
	} catch (err) {
		console.error('Erreur:', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

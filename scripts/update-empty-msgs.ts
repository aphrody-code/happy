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

			// Chercher le message du bot avec l'ancien format
			const messages = await tc.messages.fetch({ limit: 5 }).catch(() => null)
			if (!messages) continue

			for (const [, msg] of messages) {
				if (msg.author.id !== client.user!.id) continue
				if (msg.embeds.length === 0) continue

				const embed = msg.embeds[0]
				// Détecter l'ancien format
				if (embed.title?.startsWith('✨ BIENVENUE DANS') || embed.title?.startsWith('✨ BIENVENUE')) {
					const newEmbed = new EmbedBuilder()
						.setTitle(`#${tc.name}`)
						.setDescription(
							tc.topic
								? `${tc.topic}\n\nAllez, c'est à vous !`
								: 'Bienvenue dans ce salon de la guilde.'
						)
						.setColor(0xE8672A)

					// Garder le thumbnail si présent
					if (embed.thumbnail?.url) {
						newEmbed.setThumbnail(embed.thumbnail.url)
					}

					try {
						await msg.edit({ embeds: [newEmbed] })
						count++
						console.log(`  ✅ #${tc.name} mis à jour`)
					} catch (err: any) {
						console.error(`  ❌ #${tc.name}: ${err.message}`)
					}
					await sleep(300)
				}
			}
		}

		console.log(`\n✅ ${count} messages de salons mis à jour`)
	} catch (err) {
		console.error('Erreur:', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

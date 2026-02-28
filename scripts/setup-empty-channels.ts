import 'dotenv/config'

import {
	ChannelType,
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	TextChannel,
} from 'discord.js'

import { SERVER_STRUCTURE } from '../src/configs/serverStructure'

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

const GUILD_ID = '1477085423909077087'

client.once('ready', async () => {
	console.log('Bot connecté pour la configuration des salons vides...')
	try {
		const guild = await client.guilds.fetch(GUILD_ID)
		if (!guild) {
			console.error('Guilde introuvable.')

			return
		}

		const channels = await guild.channels.fetch()

		// Apllatir la structure pour une recherche facile
		const channelDefs = SERVER_STRUCTURE.flatMap(cat => cat.channels)

		let updatedCount = 0

		for (const [id, channel] of channels) {
			if (!channel || channel.type !== ChannelType.GuildText) continue

			const textChannel = channel as TextChannel

			// Vérifier si le salon est vide
			const messages = await textChannel.messages.fetch({ limit: 1 }).catch(() => null)

			if (messages && messages.size === 0) {
				console.log(`Le salon #${textChannel.name} est vide. Envoi de l'explication...`)

				// Trouver la définition
				const def = channelDefs.find(d => d.name === textChannel.name)

				const embed = new EmbedBuilder()
					.setTitle(`#${textChannel.name}`)
					.setDescription(
						def?.topic
							? `${def.topic}\n\nAllez, c'est à vous !`
							: 'Bienvenue dans ce salon de la guilde.'
					)
					.setColor(0xE8672A)
					.setThumbnail('https://i.pinimg.com/originals/a1/bd/f1/a1bdf1d65acd999c00c627b11998cd3b.gif')
					
				await textChannel.send({ embeds: [embed] })
				updatedCount++
			}
		}

		console.log(`Succès : ${updatedCount} salons vides ont été configurés.`)
	} catch (err) {
		console.error('Erreur :', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

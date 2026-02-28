import 'dotenv/config'

import { Client, GatewayIntentBits } from 'discord.js'

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
})

client.once('ready', async () => {
	console.log('Bot connecté.')
	console.log('Nombre de serveurs :', client.guilds.cache.size)
	client.guilds.cache.forEach((guild) => {
		console.log(`- ${guild.name} (${guild.id})`)
	})
	client.destroy()
	process.exit(0)
})

client.login(process.env.BOT_TOKEN)

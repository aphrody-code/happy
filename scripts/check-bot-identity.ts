import 'dotenv/config'

import { Client, GatewayIntentBits } from 'discord.js'

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
})

client.once('ready', async () => {
	console.log(`Bot connecté en tant que : ${client.user?.tag} (${client.user?.id})`)
	client.destroy()
	process.exit(0)
})

client.login(process.env.BOT_TOKEN)

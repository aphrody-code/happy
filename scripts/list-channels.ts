import 'dotenv/config'

import { Client, GatewayIntentBits } from 'discord.js'

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
})

client.once('ready', async () => {
	const guild = client.guilds.cache.get('1477085423909077087')
	if (guild) {
		const channels = await guild.channels.fetch()
		channels.forEach((channel) => {
			console.log(`${channel?.name} (${channel?.id}) [${channel?.type}]`)
		})
	}
	client.destroy()
	process.exit(0)
})

client.login(process.env.BOT_TOKEN)

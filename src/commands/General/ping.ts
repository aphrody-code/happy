import { Category } from '@discordx/utilities'
import { CommandInteraction, Message } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Slash } from '@/decorators'

@Discord()
@Category('General')
export default class PingCommand {

	@Slash({
		name: 'ping',
	})
	async ping(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const msg = (await interaction.followUp({ content: 'Aye ! Je vérifie...', fetchReply: true })) as Message

		const content = localize.COMMANDS.PING.MESSAGE({
			member: msg.inGuild() ? `${interaction.member},` : '',
			time: msg.createdTimestamp - interaction.createdTimestamp,
			heartbeat: client.ws.ping ? ` Le heartbeat est de ${Math.round(client.ws.ping)}ms.` : '',
		})

		await msg.edit(content)
	}

}

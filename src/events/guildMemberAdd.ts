import { AttachmentBuilder, ChannelType, TextChannel } from 'discord.js'
import { ArgsOf, Client } from 'discordx'

import { Discord, Injectable, On } from '@/decorators'
import { generateWelcomeCard } from '../libs/card'
import { Logger } from '@/services'

@Discord()
@Injectable()
export default class GuildMemberAddEvent {

	constructor(
		private logger: Logger
	) {}

	@On('guildMemberAdd')
	async guildMemberAddHandler(
		[member]: ArgsOf<'guildMemberAdd'>,
		client: Client
	) {
		// Chercher un salon de bienvenue
		const guild = member.guild
		const welcomeChannel = guild.channels.cache.find(
			c => c.type === ChannelType.GuildText && c.name.includes('bienvenue')
		) as TextChannel | undefined

		if (!welcomeChannel) return

		try {
			const card = await generateWelcomeCard({
				username: member.displayName,
				avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 512 }),
				memberCount: guild.memberCount,
			})

			const attachment = new AttachmentBuilder(card, { name: 'welcome.png' })

			await welcomeChannel.send({
				content: `Bienvenue ${member.toString()} ! Tu es le **${guild.memberCount}e** membre de la guilde.`,
				files: [attachment],
			})
		} catch (err) {
			this.logger.log(`Erreur welcome card pour ${member.user.tag}: ${err}`, 'error')
		}
	}
}

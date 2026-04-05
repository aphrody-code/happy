import { ChannelType, EmbedBuilder, TextChannel } from 'discord.js'
import { ArgsOf, Client } from 'discordx'

import { CHANNEL_NAMES } from '@/configs'
import { Discord, Injectable, On } from '@/decorators'
import { FairyTailGuilde } from '@/entities'
import { Database, Logger } from '@/services'

@Discord()
@Injectable()
export default class GuildMemberRemoveEvent {

	constructor(
		private logger: Logger,
		private db: Database
	) {}

	@On('guildMemberRemove')
	async guildMemberRemoveHandler(
		[member]: ArgsOf<'guildMemberRemove'>,
		client: Client
	) {
		const guild = member.guild

		// Nettoyer l'appartenance à une guilde FT si le membre part
		try {
			const membership = await this.db.get(FairyTailGuilde).findMembership(guild.id, member.user.id)
			if (membership) {
				this.db.em.remove(membership)
				await this.db.em.flush()
			}
		} catch {
			// Silencieux — pas critique
		}

		const channel = guild.channels.cache.find(
			c => c.type === ChannelType.GuildText && c.name === CHANNEL_NAMES.WELCOME
		) as TextChannel | undefined

		if (!channel) return

		const joinedAt = member.joinedAt
		const duration = joinedAt
			? this.formatDuration(Date.now() - joinedAt.getTime())
			: 'durée inconnue'

		const embed = new EmbedBuilder()
			.setColor(0x95A5A6)
			.setDescription(
				`**${member.user.displayName}** a quitté la guilde.\n`
				+ `Membre pendant ${duration}.`
			)
			.setThumbnail(member.user.displayAvatarURL({ size: 128 }))
			.setFooter({ text: `${guild.memberCount} membres restants` })
			.setTimestamp()

		await channel.send({ embeds: [embed] }).catch(() => {})
	}

	private formatDuration(ms: number): string {
		const days = Math.floor(ms / 86400000)
		if (days > 365) return `${Math.floor(days / 365)} an${Math.floor(days / 365) > 1 ? 's' : ''}`
		if (days > 30) return `${Math.floor(days / 30)} mois`
		if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`
		const hours = Math.floor(ms / 3600000)
		if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`

		return 'quelques minutes'
	}

}

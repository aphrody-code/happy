import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, TextChannel } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { ModerationLog } from '@/entities'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'
import { resolveGuild, simpleSuccessEmbed } from '@/utils/functions'

import { ModerationAction } from '../../entities/ModerationLog'

@Discord()
@Injectable()
@Category('Moderation')
export default class SlowmodeCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'slowmode' })
	@Guard(
		UserPermissions(['ManageChannels'])
	)
	async slowmode(
		@SlashOption({
			name: 'seconds',
			localizationSource: 'COMMANDS.SLOWMODE.OPTIONS.SECONDS',
			type: ApplicationCommandOptionType.Integer,
			required: true,
			minValue: 0,
			maxValue: 21600,
		}) seconds: number,
		@SlashOption({
			name: 'channel',
			localizationSource: 'COMMANDS.SLOWMODE.OPTIONS.CHANNEL',
			type: ApplicationCommandOptionType.Channel,
		}) targetChannel: TextChannel | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const channel = (targetChannel ?? interaction.channel) as TextChannel
		if (!channel) return

		await channel.setRateLimitPerUser(seconds)

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.SLOWMODE
		log.moderatorId = interaction.user.id
		log.targetId = interaction.user.id
		log.duration = seconds
		log.additionalData = { channelId: channel.id }
		await this.db.em.persistAndFlush(log)

		if (seconds === 0) {
			simpleSuccessEmbed(
				interaction,
				localize.COMMANDS.SLOWMODE.SUCCESS_OFF({ channel: `<#${channel.id}>` })
			)
		} else {
			simpleSuccessEmbed(
				interaction,
				localize.COMMANDS.SLOWMODE.SUCCESS_SET({ seconds, channel: `<#${channel.id}>` })
			)
		}
	}

}

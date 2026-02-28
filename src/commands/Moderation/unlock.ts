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
export default class UnlockCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'unlock' })
	@Guard(
		UserPermissions(['ManageChannels'])
	)
	async unlock(
		@SlashOption({
			name: 'channel',
			localizationSource: 'COMMANDS.UNLOCK.OPTIONS.CHANNEL',
			type: ApplicationCommandOptionType.Channel,
		}) targetChannel: TextChannel | undefined,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.UNLOCK.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
		}) reason: string | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const channel = (targetChannel ?? interaction.channel) as TextChannel
		if (!channel) return

		const everyoneRole = interaction.guild?.roles.everyone
		if (everyoneRole) {
			await channel.permissionOverwrites.edit(everyoneRole, {
				SendMessages: null,
			}, { reason: reason ?? undefined })
		}

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.UNLOCK
		log.moderatorId = interaction.user.id
		log.targetId = interaction.user.id
		log.reason = reason ?? null
		log.additionalData = { channelId: channel.id }
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.UNLOCK.SUCCESS({ channel: `<#${channel.id}>` })
		)
	}

}

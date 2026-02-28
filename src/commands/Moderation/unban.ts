import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { ModerationLog } from '@/entities'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'
import { resolveGuild, simpleErrorEmbed, simpleSuccessEmbed } from '@/utils/functions'

import { ModerationAction } from '../../entities/ModerationLog'

@Discord()
@Injectable()
@Category('Moderation')
export default class UnbanCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'unban' })
	@Guard(
		UserPermissions(['BanMembers'])
	)
	async unban(
		@SlashOption({
			name: 'user_id',
			localizationSource: 'COMMANDS.UNBAN.OPTIONS.USER_ID',
			type: ApplicationCommandOptionType.String,
			required: true,
		}) userId: string,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.UNBAN.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
		}) reason: string | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const discordGuild = interaction.guild
		if (!discordGuild) return

		try {
			const ban = await discordGuild.bans.fetch(userId)
			if (!ban)
				return simpleErrorEmbed(interaction, localize.COMMANDS.UNBAN.ERRORS.NOT_BANNED())
		} catch {
			return simpleErrorEmbed(interaction, localize.COMMANDS.UNBAN.ERRORS.NOT_BANNED())
		}

		await discordGuild.bans.remove(userId, reason ?? undefined)

		const user = await client.users.fetch(userId).catch(() => null)

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.UNBAN
		log.moderatorId = interaction.user.id
		log.targetId = userId
		log.reason = reason ?? null
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.UNBAN.SUCCESS({ user: user?.tag ?? userId })
		)
	}

}

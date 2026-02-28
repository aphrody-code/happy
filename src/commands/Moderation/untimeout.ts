import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from 'discord.js'
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
export default class UntimeoutCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'untimeout' })
	@Guard(
		UserPermissions(['ModerateMembers'])
	)
	async untimeout(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.UNTIMEOUT.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.UNTIMEOUT.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
		}) reason: string | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		if (!member.moderatable)
			return simpleErrorEmbed(interaction, localize.COMMANDS.UNTIMEOUT.ERRORS.NOT_MODERATABLE())

		if (!member.isCommunicationDisabled())
			return simpleErrorEmbed(interaction, localize.COMMANDS.UNTIMEOUT.ERRORS.NOT_TIMED_OUT())

		await member.timeout(null, reason ?? undefined)

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.UNTIMEOUT
		log.moderatorId = interaction.user.id
		log.targetId = member.id
		log.reason = reason ?? null
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.UNTIMEOUT.SUCCESS({ member: member.user.tag })
		)
	}

}

import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { ModerationLog, Warning } from '@/entities'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'
import { resolveGuild, simpleSuccessEmbed } from '@/utils/functions'

import { ModerationAction } from '../../entities/ModerationLog'

@Discord()
@Injectable()
@Category('Moderation')
export default class WarnCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'warn' })
	@Guard(
		UserPermissions(['ModerateMembers'])
	)
	async warn(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.WARN.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.WARN.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
			required: true,
		}) reason: string,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const warning = new Warning()
		warning.discordGuildId = guild.id
		warning.userId = member.id
		warning.moderatorId = interaction.user.id
		warning.reason = reason

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.WARN
		log.moderatorId = interaction.user.id
		log.targetId = member.id
		log.reason = reason

		await this.db.em.persistAndFlush([warning, log])

		const activeCount = await this.db.em.count(Warning, {
			discordGuildId: guild.id,
			userId: member.id,
			active: true,
		})

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.WARN.SUCCESS({ member: member.user.tag, count: activeCount })
		)
	}

}

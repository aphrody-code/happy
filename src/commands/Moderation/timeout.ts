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
export default class TimeoutCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'timeout' })
	@Guard(
		UserPermissions(['ModerateMembers'])
	)
	async timeout(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.TIMEOUT.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'duration',
			localizationSource: 'COMMANDS.TIMEOUT.OPTIONS.DURATION',
			type: ApplicationCommandOptionType.Integer,
			required: true,
			minValue: 1,
		}) duration: number,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.TIMEOUT.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
		}) reason: string | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		if (member.id === interaction.user.id)
			return simpleErrorEmbed(interaction, localize.COMMANDS.TIMEOUT.ERRORS.SELF())

		if (member.id === client.user?.id)
			return simpleErrorEmbed(interaction, localize.COMMANDS.TIMEOUT.ERRORS.BOT())

		if (member.id === guild.ownerId)
			return simpleErrorEmbed(interaction, localize.COMMANDS.TIMEOUT.ERRORS.OWNER())

		const executor = interaction.member as GuildMember
		if (member.roles.highest.position >= executor.roles.highest.position)
			return simpleErrorEmbed(interaction, localize.COMMANDS.TIMEOUT.ERRORS.HIERARCHY())

		if (!member.moderatable)
			return simpleErrorEmbed(interaction, localize.COMMANDS.TIMEOUT.ERRORS.NOT_MODERATABLE())

		const durationMs = duration * 60 * 1000
		await member.timeout(durationMs, reason ?? undefined)

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.TIMEOUT
		log.moderatorId = interaction.user.id
		log.targetId = member.id
		log.reason = reason ?? null
		log.duration = duration * 60
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.TIMEOUT.SUCCESS({ member: member.user.tag, duration })
		)
	}

}

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
export default class KickCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'kick' })
	@Guard(
		UserPermissions(['KickMembers'])
	)
	async kick(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.KICK.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.KICK.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
		}) reason: string | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		if (member.id === interaction.user.id)
			return simpleErrorEmbed(interaction, localize.COMMANDS.KICK.ERRORS.SELF())

		if (member.id === client.user?.id)
			return simpleErrorEmbed(interaction, localize.COMMANDS.KICK.ERRORS.BOT())

		if (member.id === guild.ownerId)
			return simpleErrorEmbed(interaction, localize.COMMANDS.KICK.ERRORS.OWNER())

		const executor = interaction.member as GuildMember
		if (member.roles.highest.position >= executor.roles.highest.position)
			return simpleErrorEmbed(interaction, localize.COMMANDS.KICK.ERRORS.HIERARCHY())

		if (!member.kickable)
			return simpleErrorEmbed(interaction, localize.COMMANDS.KICK.ERRORS.NOT_KICKABLE())

		await member.kick(reason ?? undefined)

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.KICK
		log.moderatorId = interaction.user.id
		log.targetId = member.id
		log.reason = reason ?? null
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.KICK.SUCCESS({ member: member.user.tag })
		)
	}

}

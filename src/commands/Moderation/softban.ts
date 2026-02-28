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
export default class SoftbanCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'softban',
		localizationSource: 'COMMANDS.SOFTBAN.DESCRIPTION',
	})
	@Guard(
		UserPermissions(['BanMembers'])
	)
	async softban(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.SOFTBAN.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.SOFTBAN.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
		}) reason: string | undefined,
		@SlashOption({
			name: 'delete_messages',
			localizationSource: 'COMMANDS.SOFTBAN.OPTIONS.DELETE_MESSAGES',
			type: ApplicationCommandOptionType.Integer,
			minValue: 1,
			maxValue: 7,
		}) deleteMessages: number = 1,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		if (member.id === interaction.user.id)
			return simpleErrorEmbed(interaction, localize.COMMANDS.BAN.ERRORS.SELF())

		if (member.id === client.user?.id)
			return simpleErrorEmbed(interaction, localize.COMMANDS.BAN.ERRORS.BOT())

		if (member.id === guild.ownerId)
			return simpleErrorEmbed(interaction, localize.COMMANDS.BAN.ERRORS.OWNER())

		const executor = interaction.member as GuildMember
		if (member.roles.highest.position >= executor.roles.highest.position)
			return simpleErrorEmbed(interaction, localize.COMMANDS.BAN.ERRORS.HIERARCHY())

		if (!member.bannable)
			return simpleErrorEmbed(interaction, localize.COMMANDS.BAN.ERRORS.NOT_BANNABLE())

		// Softban: Ban then Unban
		await member.ban({
			reason: `Softban: ${reason ?? 'No reason provided'}`,
			deleteMessageSeconds: deleteMessages * 86400,
		})
		await guild.members.unban(member.id, 'Softban: Unban')

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.SOFTBAN
		log.moderatorId = interaction.user.id
		log.targetId = member.id
		log.reason = reason ?? null
		log.additionalData = { deleteMessageDays: deleteMessages }
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.SOFTBAN.SUCCESS({ member: member.user.tag })
		)
	}

}

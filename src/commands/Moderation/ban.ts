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
export default class BanCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'ban' })
	@Guard(
		UserPermissions(['BanMembers'])
	)
	async ban(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.BAN.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.BAN.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
		}) reason: string | undefined,
		@SlashOption({
			name: 'delete_messages',
			localizationSource: 'COMMANDS.BAN.OPTIONS.DELETE_MESSAGES',
			type: ApplicationCommandOptionType.Integer,
			minValue: 0,
			maxValue: 7,
		}) deleteMessages: number | undefined,
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

		await member.ban({
			reason: reason ?? undefined,
			deleteMessageSeconds: (deleteMessages ?? 0) * 86400,
		})

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.BAN
		log.moderatorId = interaction.user.id
		log.targetId = member.id
		log.reason = reason ?? null
		log.additionalData = deleteMessages ? { deleteMessageDays: deleteMessages } : null
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.BAN.SUCCESS({ member: member.user.tag })
		)
	}

}

import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, GuildMember, Role } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash, SlashChoice, SlashOption } from '@/decorators'
import { ModerationLog } from '@/entities'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'
import { resolveGuild, simpleErrorEmbed, simpleSuccessEmbed } from '@/utils/functions'

import { ModerationAction } from '../../entities/ModerationLog'

@Discord()
@Injectable()
@Category('Admin')
export default class RoleCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'role' })
	@Guard(
		UserPermissions(['ManageRoles'])
	)
	async role(
		@SlashChoice({ name: 'add', value: 'add' })
		@SlashChoice({ name: 'remove', value: 'remove' })
		@SlashOption({
			name: 'action',
			localizationSource: 'COMMANDS.ROLE.OPTIONS.ACTION',
			type: ApplicationCommandOptionType.String,
			required: true,
		}) action: string,
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.ROLE.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'role',
			localizationSource: 'COMMANDS.ROLE.OPTIONS.ROLE',
			type: ApplicationCommandOptionType.Role,
			required: true,
		}) role: Role,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const botMember = interaction.guild?.members.me
		if (botMember && role.position >= botMember.roles.highest.position)
			return simpleErrorEmbed(interaction, localize.COMMANDS.ROLE.ERRORS.HIERARCHY())

		if (action === 'add') {
			if (member.roles.cache.has(role.id))
				return simpleErrorEmbed(interaction, localize.COMMANDS.ROLE.ERRORS.ALREADY_HAS({ member: member.user.tag, role: role.name }))

			await member.roles.add(role)

			const log = new ModerationLog()
			log.discordGuildId = guild.id
			log.action = ModerationAction.ROLE_ADD
			log.moderatorId = interaction.user.id
			log.targetId = member.id
			log.additionalData = { roleId: role.id, roleName: role.name }
			await this.db.em.persistAndFlush(log)

			simpleSuccessEmbed(
				interaction,
				localize.COMMANDS.ROLE.SUCCESS_ADD({ role: role.name, member: member.user.tag })
			)
		} else {
			if (!member.roles.cache.has(role.id))
				return simpleErrorEmbed(interaction, localize.COMMANDS.ROLE.ERRORS.DOES_NOT_HAVE({ member: member.user.tag, role: role.name }))

			await member.roles.remove(role)

			const log = new ModerationLog()
			log.discordGuildId = guild.id
			log.action = ModerationAction.ROLE_REMOVE
			log.moderatorId = interaction.user.id
			log.targetId = member.id
			log.additionalData = { roleId: role.id, roleName: role.name }
			await this.db.em.persistAndFlush(log)

			simpleSuccessEmbed(
				interaction,
				localize.COMMANDS.ROLE.SUCCESS_REMOVE({ role: role.name, member: member.user.tag })
			)
		}
	}

}

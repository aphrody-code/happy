import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from 'discord.js'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { ModerationLog } from '@/entities'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'
import { resolveGuild, simpleErrorEmbed, simpleSuccessEmbed } from '@/utils/functions'

import { ModerationAction } from '../../entities/ModerationLog'

@Discord()
@Injectable()
@Category('Moderation')
export default class NickCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'nick',
		localizationSource: 'COMMANDS.NICK.DESCRIPTION',
	})
	@Guard(
		UserPermissions(['ManageNicknames'])
	)
	async nick(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.NICK.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'nickname',
			localizationSource: 'COMMANDS.NICK.OPTIONS.NICKNAME',
			type: ApplicationCommandOptionType.String,
		}) nickname: string | undefined,
		interaction: CommandInteraction,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		try {
			await member.setNickname(nickname ?? null)

			const log = new ModerationLog()
			log.discordGuildId = guild.id
			log.action = ModerationAction.NICKNAME
			log.moderatorId = interaction.user.id
			log.targetId = member.id
			log.additionalData = { nickname: nickname ?? 'Reset' }
			await this.db.em.persistAndFlush(log)

			if (nickname) {
				simpleSuccessEmbed(
					interaction,
					localize.COMMANDS.NICK.SUCCESS({ member: member.user.tag, nickname })
				)
			} else {
				simpleSuccessEmbed(
					interaction,
					localize.COMMANDS.NICK.RESET({ member: member.user.tag })
				)
			}
		} catch (error) {
			simpleErrorEmbed(interaction, 'I do not have permission to change this member\'s nickname.')
		}
	}

}

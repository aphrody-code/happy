import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { ModerationLog } from '@/entities'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'
import { resolveGuild } from '@/utils/functions'

@Discord()
@Injectable()
@Category('Moderation')
export default class ModlogsCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'modlogs',
		localizationSource: 'COMMANDS.MODLOGS.DESCRIPTION',
	})
	@Guard(
		UserPermissions(['ModerateMembers'])
	)
	async modlogs(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.MODLOGS.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
			interaction: CommandInteraction,
			{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const logs = await this.db.em.find(ModerationLog, {
			discordGuildId: guild.id,
			targetId: member.id,
		}, { orderBy: { createdAt: 'DESC' }, limit: 10 })

		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.MODLOGS.EMBED.TITLE({ member: member.user.tag }))
			.setColor(logs.length > 0 ? 0x3498DB : 0x57F287)

		if (logs.length === 0) {
			embed.setDescription(localize.COMMANDS.MODLOGS.EMBED.NO_LOGS())
		} else {
			const entries = logs.map(log =>
				localize.COMMANDS.MODLOGS.EMBED.LOG_ENTRY({
					id: log.id,
					action: log.action.toUpperCase(),
					moderator: log.moderatorId,
					date: log.createdAt.toLocaleDateString(),
					reason: log.reason ?? 'No reason provided',
				})
			)
			embed.setDescription(entries.join('\n\n'))
			if (logs.length === 10) {
				embed.setFooter({ text: 'Showing the 10 most recent logs.' })
			}
		}

		await interaction.reply({ embeds: [embed] })
	}

}

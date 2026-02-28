import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash, SlashChoice, SlashOption } from '@/decorators'
import { Warning } from '@/entities'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'
import { resolveGuild, simpleSuccessEmbed } from '@/utils/functions'

@Discord()
@Injectable()
@Category('Moderation')
export default class WarningsCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'warnings' })
	@Guard(
		UserPermissions(['ModerateMembers'])
	)
	async warnings(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.WARNINGS.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashChoice({ name: 'view', value: 'view' })
		@SlashChoice({ name: 'clear', value: 'clear' })
		@SlashOption({
			name: 'action',
			localizationSource: 'COMMANDS.WARNINGS.OPTIONS.ACTION',
			type: ApplicationCommandOptionType.String,
		}) action: string | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const selectedAction = action ?? 'view'

		if (selectedAction === 'clear') {
			const warnings = await this.db.em.find(Warning, {
				discordGuildId: guild.id,
				userId: member.id,
				active: true,
			})

			const count = warnings.length
			for (const w of warnings) {
				w.active = false
			}
			await this.db.em.flush()

			return simpleSuccessEmbed(
				interaction,
				localize.COMMANDS.WARNINGS.CLEARED({ member: member.user.tag, count })
			)
		}

		const warnings = await this.db.em.find(Warning, {
			discordGuildId: guild.id,
			userId: member.id,
			active: true,
		}, { orderBy: { createdAt: 'DESC' } })

		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.WARNINGS.EMBED.TITLE({ member: member.user.tag }))
			.setColor(warnings.length > 0 ? 0xFEE75C : 0x57F287)

		if (warnings.length === 0) {
			embed.setDescription(localize.COMMANDS.WARNINGS.EMBED.NO_WARNINGS())
		} else {
			const entries = warnings.map(w =>
				localize.COMMANDS.WARNINGS.EMBED.WARNING_ENTRY({
					id: w.id,
					moderator: w.moderatorId,
					date: w.createdAt.toLocaleDateString(),
					reason: w.reason,
				})
			)
			embed.setDescription(entries.join('\n\n'))
		}

		await interaction.followUp({ embeds: [embed] })
	}

}

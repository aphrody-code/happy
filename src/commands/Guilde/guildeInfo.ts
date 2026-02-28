import { Category } from '@discordx/utilities'
import { CommandInteraction, EmbedBuilder } from 'discord.js'
import { Client } from 'discordx'

import { fairyTailGuildes } from '@/configs'
import { Discord, Injectable, Slash } from '@/decorators'
import { FairyTailGuilde } from '@/entities'
import { Database } from '@/services'
import { getColor, resolveGuild } from '@/utils/functions'

@Discord()
@Injectable()
@Category('Guilde')
export default class GuildeInfoCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'guilde-info' })
	async guildeInfo(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const discordGuild = resolveGuild(interaction)
		if (!discordGuild) return

		const repo = this.db.get(FairyTailGuilde) as InstanceType<typeof import('@/entities').FairyTailGuildeRepository>
		const allMemberships = await repo.getAllMembershipsForServer(discordGuild.id)

		// Compter les membres par guilde
		const counts = new Map<string, number>()
		for (const m of allMemberships) {
			counts.set(m.guildeId, (counts.get(m.guildeId) ?? 0) + 1)
		}

		const formatGuildes = (guildes: typeof fairyTailGuildes) =>
			guildes.map((g) => {
				const count = counts.get(g.id) ?? 0
				const countText = count === 0
					? localize.COMMANDS.GUILDE_INFO.EMBED.NO_MEMBERS()
					: localize.COMMANDS.GUILDE_INFO.EMBED.MEMBER_COUNT({ count })

				return `${g.emoji} **${g.name}** — ${countText}`
			}).join('\n')

		const legalGuildes = fairyTailGuildes.filter(g => g.type === 'legale')
		const darkGuildes = fairyTailGuildes.filter(g => g.type === 'noire')
		const independentGuildes = fairyTailGuildes.filter(g => g.type === 'independante')

		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.GUILDE_INFO.EMBED.TITLE())
			.setColor(getColor('guildeDefault'))
			.setThumbnail(client.user?.displayAvatarURL() ?? null)
			.addFields(
				{
					name: localize.COMMANDS.GUILDE_INFO.EMBED.LEGAL_TITLE(),
					value: formatGuildes(legalGuildes),
				},
				{
					name: localize.COMMANDS.GUILDE_INFO.EMBED.DARK_TITLE(),
					value: formatGuildes(darkGuildes),
				},
				{
					name: localize.COMMANDS.GUILDE_INFO.EMBED.INDEPENDENT_TITLE(),
					value: formatGuildes(independentGuildes),
				}
			)
			.setFooter({ text: `Total: ${allMemberships.length} membre${allMemberships.length !== 1 ? 's' : ''}` })

		interaction.followUp({ embeds: [embed] })
	}

}

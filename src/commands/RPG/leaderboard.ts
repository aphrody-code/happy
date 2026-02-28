import { Category } from '@discordx/utilities'
import { CommandInteraction, EmbedBuilder } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash } from '@/decorators'
import { RPGPlayer } from '@/entities'
import { Database } from '@/services'
import { resolveGuild } from '@/utils/functions'

@Discord()
@Injectable()
@Category('RPG')
export default class LeaderboardCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'leaderboard',
		description: 'Classement des mages les plus puissants de la guilde.',
	})
	async leaderboard(
		interaction: CommandInteraction,
		client: Client
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const players = await this.db.get(RPGPlayer).find(
			{ discordGuildId: guild.id },
			{ orderBy: [{ level: 'DESC' }, { xp: 'DESC' }], limit: 15 }
		)

		if (players.length === 0) {
			return interaction.followUp({ content: 'Aucun mage inscrit pour le moment.', ephemeral: true })
		}

		const medals = ['🥇', '🥈', '🥉']
		const lines = await Promise.all(
			players.map(async (p, i) => {
				const prefix = i < 3 ? medals[i] : `\`${i + 1}.\``
				const user = await client.users.fetch(p.userId).catch(() => null)
				const name = user?.displayName ?? p.userId
				const xpNeeded = p.level * 100
				return `${prefix} **${name}** — Nv. ${p.level} (${p.xp}/${xpNeeded} XP) — ${p.jewels.toLocaleString('fr-FR')} J`
			})
		)

		const embed = new EmbedBuilder()
			.setColor(0xE8672A)
			.setTitle('Classement des Mages')
			.setDescription(lines.join('\n'))
			.setFooter({ text: `${players.length} mage${players.length > 1 ? 's' : ''} classé${players.length > 1 ? 's' : ''}` })
			.setTimestamp()

		interaction.followUp({ embeds: [embed] })
	}

}

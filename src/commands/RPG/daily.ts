import { Category } from '@discordx/utilities'
import { CommandInteraction, EmbedBuilder } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash } from '@/decorators'
import { RPGPlayer } from '@/entities'
import { Database } from '@/services'
import { resolveGuild } from '@/utils/functions'

const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24h
const BASE_REWARD = 200
const STREAK_BONUS = 50
const MAX_STREAK = 7

@Discord()
@Injectable()
@Category('RPG')
export default class DailyCommand {

	private lastDaily = new Map<string, { time: number; streak: number }>()

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'daily',
		description: 'Récupérer votre récompense quotidienne de Joyaux.',
	})
	async daily(
		interaction: CommandInteraction,
		client: Client
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const key = `${guild.id}:${interaction.user.id}`
		const now = Date.now()
		const last = this.lastDaily.get(key)

		if (last && now - last.time < DAILY_COOLDOWN_MS) {
			const remaining = DAILY_COOLDOWN_MS - (now - last.time)
			const hours = Math.floor(remaining / 3600000)
			const minutes = Math.floor((remaining % 3600000) / 60000)

			return interaction.followUp({
				content: `Tu as déjà récupéré ta récompense aujourd'hui. Reviens dans **${hours}h ${minutes}min**.`,
				ephemeral: true,
			})
		}

		// Calculer le streak
		let streak = 1
		if (last) {
			const timeSince = now - last.time
			// Si moins de 48h, on continue le streak
			if (timeSince < DAILY_COOLDOWN_MS * 2) {
				streak = Math.min(last.streak + 1, MAX_STREAK)
			}
		}

		this.lastDaily.set(key, { time: now, streak })

		const reward = BASE_REWARD + (streak - 1) * STREAK_BONUS

		const repo = this.db.get(RPGPlayer) as import('@/entities').RPGPlayerRepository
		const player = await repo.findOrCreate(interaction.user.id, guild.id)
		player.jewels += reward
		player.xp += 25
		await this.db.em.flush()

		const streakBar = Array.from({ length: MAX_STREAK }, (_, i) =>
			i < streak ? '🔥' : '⬛'
		).join('')

		const embed = new EmbedBuilder()
			.setColor(0xF1C40F)
			.setTitle('Récompense quotidienne')
			.setDescription(
				`**+${reward} Joyaux** récupérés ! (+25 XP)\n\n` +
				`Série : ${streakBar} (${streak}/${MAX_STREAK})\n` +
				`${streak >= MAX_STREAK ? '**Série maximale !** Bonus x7' : `Demain : +${BASE_REWARD + streak * STREAK_BONUS} J`}\n\n` +
				`Solde : **${player.jewels.toLocaleString('fr-FR')} J**`
			)
			.setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))

		interaction.followUp({ embeds: [embed] })
	}

}

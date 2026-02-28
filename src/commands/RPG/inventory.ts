import { Category } from '@discordx/utilities'
import { CommandInteraction, EmbedBuilder } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash } from '@/decorators'
import { RPGItem, RPGPlayer } from '@/entities'
import { Database } from '@/services'
import { resolveGuild } from '@/utils/functions'

import { SHOP_ITEMS } from './shop'

@Discord()
@Injectable()
@Category('RPG')
export default class InventoryCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'inventaire',
		description: 'Voir votre inventaire d\'objets.',
	})
	async inventory(
		interaction: CommandInteraction,
		client: Client
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const repo = this.db.get(RPGPlayer) as import('@/entities').RPGPlayerRepository
		const player = await repo.findOrCreate(interaction.user.id, guild.id)

		const items = await this.db.get(RPGItem).find({ player })

		if (items.length === 0) {
			return interaction.followUp({
				content: 'Ton inventaire est vide. Utilise `/shop` pour acheter des objets.',
				ephemeral: true,
			})
		}

		const lines = items.map(item => {
			const shopData = SHOP_ITEMS.find(s => s.id === item.itemId)
			const emoji = shopData?.emoji ?? '📦'
			return `${emoji} **${item.name}** x${item.quantity}`
		})

		const embed = new EmbedBuilder()
			.setColor(0xE8672A)
			.setTitle(`Inventaire de ${interaction.user.displayName}`)
			.setDescription(lines.join('\n'))
			.setFooter({ text: `${items.length} objet${items.length > 1 ? 's' : ''} • ${player.jewels.toLocaleString('fr-FR')} J` })

		interaction.followUp({ embeds: [embed] })
	}

}

import { Category } from '@discordx/utilities'
import {
	ActionRowBuilder,
	CommandInteraction,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
} from 'discord.js'
import { Client, SelectMenuComponent } from 'discordx'

import { Discord, Injectable, Slash } from '@/decorators'
import { RPGItem, RPGPlayer } from '@/entities'
import { Database } from '@/services'
import { resolveGuild } from '@/utils/functions'

// ── Catalogue ──

export interface ShopItem {
	id: string
	name: string
	description: string
	price: number
	emoji: string
	effect?: { hp?: number; mp?: number; maxHp?: number; maxMp?: number }
}

export const SHOP_ITEMS: ShopItem[] = [
	{ id: 'potion-hp', name: 'Potion de soin', description: 'Restaure 50 PV', price: 100, emoji: '🧪', effect: { hp: 50 } },
	{ id: 'potion-mp', name: 'Potion de magie', description: 'Restaure 30 PM', price: 120, emoji: '💧', effect: { mp: 30 } },
	{ id: 'potion-hp-max', name: 'Élixir vital', description: 'Restaure tous les PV', price: 500, emoji: '❤️‍🔥' },
	{ id: 'potion-mp-max', name: 'Élixir magique', description: 'Restaure tous les PM', price: 600, emoji: '💎' },
	{ id: 'crystal-force', name: 'Cristal de force', description: '+20 PV max (permanent)', price: 1500, emoji: '🔮', effect: { maxHp: 20 } },
	{ id: 'crystal-magic', name: 'Cristal de magie', description: '+10 PM max (permanent)', price: 1500, emoji: '✨', effect: { maxMp: 10 } },
	{ id: 'lacrima-feu', name: 'Lacrima de feu', description: 'Une lacrima contenant de la magie de feu', price: 2000, emoji: '🔥' },
	{ id: 'lacrima-glace', name: 'Lacrima de glace', description: 'Une lacrima contenant de la magie de glace', price: 2000, emoji: '🧊' },
	{ id: 'cle-argent', name: 'Clé du Zodiaque (argent)', description: 'Clé d\'invocation d\'un esprit stellaire', price: 5000, emoji: '🔑' },
	{ id: 'cle-or', name: 'Clé du Zodiaque (or)', description: 'Clé d\'invocation d\'un esprit d\'or', price: 15000, emoji: '🗝️' },
]

@Discord()
@Injectable()
@Category('RPG')
export default class ShopCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'shop',
		description: 'Voir la boutique de la guilde.',
	})
	async shop(
		interaction: CommandInteraction,
		client: Client
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const player = await (this.db.get(RPGPlayer) as import('@/entities').RPGPlayerRepository)
			.findOrCreate(interaction.user.id, guild.id)

		const lines = SHOP_ITEMS.map(item =>
			`${item.emoji} **${item.name}** — ${item.price.toLocaleString('fr-FR')} J\n_${item.description}_`
		)

		const embed = new EmbedBuilder()
			.setColor(0xE8672A)
			.setTitle('Boutique de Magnolia')
			.setDescription(lines.join('\n\n'))
			.setFooter({ text: `Vos Joyaux : ${player.jewels.toLocaleString('fr-FR')} J` })

		const menu = new StringSelectMenuBuilder()
			.setCustomId('shop-buy')
			.setPlaceholder('Acheter un objet...')
			.addOptions(SHOP_ITEMS.map(item => ({
				label: `${item.name} — ${item.price} J`,
				value: item.id,
				emoji: item.emoji,
				description: item.description.substring(0, 100),
			})))

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)

		interaction.followUp({ embeds: [embed], components: [row] })
	}

	@SelectMenuComponent({ id: 'shop-buy' })
	async handleBuy(interaction: StringSelectMenuInteraction, client: Client) {
		const guild = interaction.guild
		if (!guild) return

		const itemId = interaction.values[0]
		const shopItem = SHOP_ITEMS.find(i => i.id === itemId)
		if (!shopItem) return

		const repo = this.db.get(RPGPlayer) as import('@/entities').RPGPlayerRepository
		const player = await repo.findOrCreate(interaction.user.id, guild.id)

		if (player.jewels < shopItem.price) {
			return interaction.reply({
				content: `Pas assez de Joyaux. Il te faut **${shopItem.price.toLocaleString('fr-FR')} J** mais tu n'en as que **${player.jewels.toLocaleString('fr-FR')} J**.`,
				ephemeral: true,
			})
		}

		player.jewels -= shopItem.price

		// Appliquer les effets immédiats
		if (shopItem.effect) {
			if (shopItem.effect.hp) player.hp = Math.min(player.hp + shopItem.effect.hp, player.maxHp)
			if (shopItem.effect.mp) player.mp = Math.min(player.mp + shopItem.effect.mp, player.maxMp)
			if (shopItem.effect.maxHp) { player.maxHp += shopItem.effect.maxHp; player.hp += shopItem.effect.maxHp }
			if (shopItem.effect.maxMp) { player.maxMp += shopItem.effect.maxMp; player.mp += shopItem.effect.maxMp }
		}

		if (itemId === 'potion-hp-max') player.hp = player.maxHp
		if (itemId === 'potion-mp-max') player.mp = player.maxMp

		// Ajouter à l'inventaire (sauf consommables immédiats)
		const isConsumable = ['potion-hp', 'potion-mp', 'potion-hp-max', 'potion-mp-max', 'crystal-force', 'crystal-magic'].includes(itemId)

		if (!isConsumable) {
			const existingItem = await this.db.get(RPGItem).findOne({ player, itemId })
			if (existingItem) {
				existingItem.quantity += 1
			} else {
				const newItem = new RPGItem()
				newItem.itemId = itemId
				newItem.name = shopItem.name
				newItem.quantity = 1
				newItem.player = player
				this.db.em.persist(newItem)
			}
		}

		await this.db.em.flush()

		const embed = new EmbedBuilder()
			.setColor(0x2ECC71)
			.setDescription(
				`${shopItem.emoji} **${shopItem.name}** acheté !\n` +
				`-${shopItem.price.toLocaleString('fr-FR')} J → Solde : **${player.jewels.toLocaleString('fr-FR')} J**`
			)

		await interaction.reply({ embeds: [embed], ephemeral: true })
	}

}

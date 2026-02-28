import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, AttachmentBuilder, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Client } from 'discordx'

import { fairyTailGuildes } from '@/configs'
import { Discord, Injectable, Slash, SlashGroup, SlashOption } from '@/decorators'
import { FairyTailGuilde } from '@/entities'
import { generateProfileCard } from '../../libs/card'
import { Database, RPGService, WorldManager } from '@/services'
import { getColor, resolveGuild } from '@/utils/functions'

@Discord()
@Injectable()
@Category('RPG')
@SlashGroup({ name: 'rpg', description: 'Commandes du moteur Fairy Tail RPG.' })
@SlashGroup('rpg')
export default class RPGCommand {

	constructor(
		private rpgService: RPGService,
		private worldManager: WorldManager,
		private db: Database
	) {}

	@Slash({
		name: 'profil',
		description: 'Affiche votre profil RPG.',
	})
	async profil(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const player = await this.rpgService.getPlayer(interaction.user.id, guild.id)
		const location = this.worldManager.getRoom(player.currentLocation)?.name || player.currentLocation

		// Récupérer la guilde FT du joueur
		const membership = await this.db.get(FairyTailGuilde).findMembership(guild.id, interaction.user.id)
		const guildeName = membership
			? fairyTailGuildes.find((g) => g.id === membership.guildeId)?.name
			: undefined

		// XP nécessaire pour le prochain niveau
		const xpNeeded = player.level * 100

		const card = await generateProfileCard({
			username: interaction.user.displayName,
			avatarUrl: interaction.user.displayAvatarURL({ extension: 'png', size: 512 }),
			level: player.level,
			xp: player.xp,
			xpNeeded,
			jewels: player.jewels,
			hp: player.hp,
			maxHp: player.maxHp,
			mp: player.mp,
			maxMp: player.maxMp,
			location,
			guild: guildeName,
		})

		const attachment = new AttachmentBuilder(card, { name: 'profile.png' })
		interaction.followUp({ files: [attachment] })
	}

	@Slash({
		name: 'explorer',
		description: 'Explore le lieu actuel.',
	})
	async explorer(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const { player, room } = await this.rpgService.getExploreInfo(interaction.user.id, guild.id)
		if (!room) return

		const embed = new EmbedBuilder()
			.setColor(getColor('happy'))
			.setTitle(localize.COMMANDS.RPG.EXPLORE_TITLE({ location: room.name }))
			.setDescription(room.description)

		if (room.npcs && room.npcs.length > 0) {
			embed.addFields({ name: localize.COMMANDS.RPG.NPC_HEADER(), value: room.npcs.map(n => `• ${n}`).join('\n') })
		}

		if (room.items && room.items.length > 0) {
			embed.addFields({ name: localize.COMMANDS.RPG.ITEM_HEADER(), value: room.items.map(i => `• ${i}`).join('\n') })
		}

		if (room.connections && room.connections.length > 0) {
			const connectedRooms = room.connections.map(id => this.worldManager.getRoom(id)?.name || id)
			embed.addFields({ name: localize.COMMANDS.RPG.CONNECTION_HEADER(), value: connectedRooms.map(n => `• ${n}`).join('\n') })
		}

		interaction.followUp({ embeds: [embed] })
	}

	@Slash({
		name: 'deplacer',
		description: 'Se déplacer vers un autre lieu.',
	})
	async deplacer(
		@SlashOption({
			name: 'lieu',
			description: 'Le lieu où se rendre.',
			type: ApplicationCommandOptionType.String,
			required: true,
		}) locationId: string,
			interaction: CommandInteraction,
			client: Client,
			{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const result = await this.rpgService.movePlayer(interaction.user.id, guild.id, locationId)

		if (result.success) {
			interaction.followUp({ content: result.message })
		} else {
			interaction.followUp({ content: result.message, ephemeral: true })
		}
	}

	@Slash({
		name: 'parler',
		description: 'Parler à un personnage présent.',
	})
	async parler(
		@SlashOption({
			name: 'personnage',
			description: 'Le personnage à qui parler.',
			type: ApplicationCommandOptionType.String,
			required: true,
		}) npcId: string,
			interaction: CommandInteraction,
			client: Client,
			{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const { player, room } = await this.rpgService.getExploreInfo(interaction.user.id, guild.id)
		if (!room || !room.npcs?.includes(npcId)) {
			interaction.followUp({ content: 'Ce personnage n\'est pas ici.', ephemeral: true })

			return
		}

		// Simple narrative response for now
		const dialogue = this.rpgService.getDialogue(npcId, 'start')
		if (!dialogue) {
			interaction.followUp({ content: `${npcId} ne semble pas avoir envie de parler.` })

			return
		}

		const embed = new EmbedBuilder()
			.setColor(getColor('happy'))
			.setAuthor({ name: npcId })
			.setDescription(dialogue.text)

		interaction.followUp({ embeds: [embed] })
	}

}

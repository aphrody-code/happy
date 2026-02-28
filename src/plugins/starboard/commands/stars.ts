import { Category } from '@discordx/utilities'
import { wrap } from '@mikro-orm/core'
import { ApplicationCommandOptionType, Channel, CommandInteraction } from 'discord.js'
import { Client } from 'discordx'
import { injectable } from 'tsyringe'

import { Discord, Slash, SlashGroup, SlashOption } from '@/decorators'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'

import { StarBoard, StarBoardMessage } from '../entities'

@Discord()
@injectable()
@Category('Admin')
@SlashGroup({ name: 'stars', localizationSource: 'StarBoard.STARBOARD.STAR_DESC' as any })
@SlashGroup('stars')
export default class StarsCommand {

	private db: Database
	constructor(db: Database) {
		this.db = db
	}

	@Slash({
		name: 'set',
		localizationSource: 'StarBoard.STARBOARD.STAR_DESC' as any,
	})
	@Guard(
		UserPermissions(['Administrator'])
	)
	async set(
		@SlashOption({
			name: 'channel',
			localizationSource: 'StarBoard.STARBOARD.STAR_SET_CHAN' as any,
			required: false,
			type: ApplicationCommandOptionType.Channel,
		})
		channel: Channel,

		@SlashOption({
			name: 'emoji',
			localizationSource: 'StarBoard.STARBOARD.STAR_SET_EMOJI' as any,
			required: false,
			type: ApplicationCommandOptionType.String,
		})
		emoji: string,

		@SlashOption({
			name: 'minstar',
			localizationSource: 'StarBoard.STARBOARD.STAR_MIN_EMOJI' as any,
			required: false,
			type: ApplicationCommandOptionType.Integer,
		})
		minStar: number,

		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		// Vérifications
		if (!interaction.guildId) return interaction.followUp({ content: (localize as any).StarBoard.STARBOARD.STAR_ERR_GUILD.MESSAGE(), ephemeral: true })
		if (!channel && !emoji && !minStar) return interaction.followUp({ content: (localize as any).StarBoard.STARBOARD.STAR_ERR_PARAM.MESSAGE(), ephemeral: true })

		// Analyser l'emoji
		if (emoji) {
			const parsed = /^<a?:[A-z]+:([0-9]+)>$/.exec(emoji.trim())
			if (parsed && parsed.length === 2) emoji = parsed[1]
			else {
				if (/^\p{Extended_Pictographic}$/u.test(emoji.trim())) emoji = emoji.trim()
				else interaction.followUp({ content: (localize as any).StarBoard.STARBOARD.STAR_ERR_EMOJI.MESSAGE(), ephemeral: true })
			}
		}

		// Récupérer la configuration actuelle
		const starRepo = this.db.get(StarBoard)
		const starMessageRepo = this.db.get(StarBoardMessage)
		const chanStars = await starRepo.findOne({ guildId: interaction.guildId })

		// Si pas de config :
		if (!chanStars) {
			if (!channel) return interaction.followUp({ content: (localize as any).StarBoard.STARBOARD.STAR_SLC_CHAN.MESSAGE(), ephemeral: true })

			const starboard = new StarBoard()
			starboard.guildId = interaction.guildId
			starboard.channelId = channel.id
			if (emoji) starboard.emoji = emoji
			if (minStar) starboard.minStar = minStar

			await this.db.em.persistAndFlush(starboard)
			this.db.em.clearCache(`star_guild_${interaction.guildId}`)
			await interaction.followUp({
				content: (localize as any).StarBoard.STARBOARD.STAR_CHAN_SET.MESSAGE(),
				ephemeral: true,
			})
		} else {
			// Mettre à jour les messages précédemment starred
			const previousMessages = await starMessageRepo.find({ starboard: chanStars, starboardChannel: null })
			if (previousMessages && previousMessages.length > 0) {
				for (const el of previousMessages) {
					wrap(el).assign({ starboardChannel: chanStars.channelId })
				}
				await this.db.em.flush()
			}

			// Mettre à jour le starboard
			if (emoji) chanStars.emoji = emoji
			if (minStar) chanStars.minStar = minStar
			if (channel) chanStars.channelId = channel.id

			await this.db.em.flush()
			this.db.em.clearCache(`star_guild_${interaction.guildId}`)
			await interaction.followUp({
				content: (localize as any).StarBoard.STARBOARD.STAR_CFG_UPDATED.MESSAGE(),
				ephemeral: true,
			})
		}
	}

}

import { Loaded } from '@mikro-orm/core'
import dayjs from 'dayjs'
import { ButtonBuilder, ButtonStyle, EmbedBuilder, MessageReaction, PartialMessageReaction, TextChannel } from 'discord.js'
import { Client } from 'discordx'
import { injectable } from 'tsyringe'

import { Discord, OnCustom } from '@/decorators'
import { Database } from '@/services'

import { StarBoard, StarBoardMessage } from '../../entities'

@Discord()
@injectable()
export default class newStarEvent {

	private client: Client
	private db: Database
	constructor(client: Client, db: Database) {
		this.client = client
		this.db = db
	}

	@OnCustom('newStar')
	async newStarHandler(
		starMessage: Loaded<StarBoardMessage, never>,
		reaction: MessageReaction | PartialMessageReaction,
		chanStars: Loaded<StarBoard, never>
	) {
		const starMessageRepo = this.db.get(StarBoardMessage)

		// Définir l'image
		let image = ''
		if (reaction.message.attachments.size > 0) {
			image = reaction.message.attachments.first()!.url
		}

		// Vérifier si le message contient une image embed
		if (reaction.message.embeds.length > 0) {
			if (reaction.message.embeds[0].image) {
				image = reaction.message.embeds[0].image.url
			}
		}

		let embed = new EmbedBuilder()
			.setAuthor({
				name: reaction.message.author!.username,
				iconURL: reaction.message.author!.avatarURL()!,
			})
			.setColor('#FFD700')
			.setFooter({
				text: dayjs(reaction.message.createdAt).format('DD/MM/YYYY HH:mm'),
			})

		// Ajouter l'image si présente
		if (image) embed = embed.setImage(image)

		// Ajouter le contenu du message si présent
		if (reaction.message.content) embed = embed.setDescription(reaction.message.content)

		const btn = new ButtonBuilder()
			.setLabel('Message original')
			.setStyle(ButtonStyle.Link)
			.setURL(reaction.message.url)

		const guild = await this.client.guilds.fetch(chanStars.guildId)
		const channel = await guild.channels.fetch(chanStars.channelId) as TextChannel

		const newStarMessageDiscord = await channel.send({
			content: `${reaction.emoji.toString()} ${reaction.message.reactions.cache.get(chanStars.emoji)!.count} | ${reaction.message.channel.toString()}`,
			embeds: [embed],
			components: [{
				type: 1,
				components: [btn],
			}],
		})

		const newStarMsg = new StarBoardMessage()
		newStarMsg.srcMessage = reaction.message.id
		newStarMsg.starboardMessage = newStarMessageDiscord.id
		newStarMsg.starCount = reaction.message.reactions.cache.get(chanStars.emoji)!.count
		newStarMsg.starboard = chanStars
		await this.db.em.persistAndFlush(newStarMsg)
		this.db.em.clearCache(`star_message_${reaction.message.id}`)
	}

}

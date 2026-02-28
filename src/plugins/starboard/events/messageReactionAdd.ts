import { injectable } from 'tsyringe'
import { Client, ArgsOf } from 'discordx'

import { Discord, On } from '@/decorators'
import { Database, EventManager } from '@/services'
import { resolveDependency } from '@/utils/functions'
import { StarBoard, StarBoardMessage } from '../entities'

@Discord()
@injectable()
export default class messageReactionAddEvent {

	private eventManager: EventManager
	constructor(eventManager: EventManager) {
		this.eventManager = eventManager
	}

	@On('messageReactionAdd')
	async messageReactionAddHandler(
		[reaction, user]: ArgsOf<'messageReactionAdd'>,
		client: Client,
	) {
		// Récupérer les messages partiels (anciens messages)
		if (reaction.message.partial) await reaction.message.fetch()
		// Résoudre les repositories
		const db = await resolveDependency(Database)
		const starboardRepo = db.get(StarBoard)
		const starMessageRepo = db.get(StarBoardMessage)
		// Vérifier si le serveur a un starboard configuré
		const chanStars = await starboardRepo.findOne({ guildId: reaction.message.guildId }, { cache: ['star_guild_' + reaction.message.guildId, 60_1000] })
		if (!chanStars) return
		// Ignorer si le message starred est dans le salon starboard
		if (chanStars && chanStars.channelId === reaction.message.channelId) return
		// Ignorer si la réaction ne correspond pas à l'emoji configuré
		if ((reaction.emoji.id ?? reaction.emoji.toString()) !== chanStars.emoji) return
		// Vérifier le minimum de réactions
		if (reaction.message.reactions.cache.get(chanStars.emoji)!.count < chanStars.minStar) return
		// Vérifier si le message est déjà dans le starboard
		const starMessage = await starMessageRepo.findOne({ srcMessage: reaction.message.id }, { cache: ['star_message_' + reaction.message.id, 60_1000] })
		// Si le message n'est pas dans le starboard, en créer un nouveau
		if (!starMessage) {
			this.eventManager.emit('newStar', starMessage, reaction, chanStars)
		}
		// Si le message est dans le starboard et le compteur a changé, le mettre à jour
		else if (starMessage.starCount < reaction.message.reactions.cache.get(chanStars.emoji)!.count) {
			this.eventManager.emit('updateStar', starMessage, reaction, chanStars)
		}
	}
}

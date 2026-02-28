import { delay, inject } from 'tsyringe'

import { Service } from '@/decorators'
import { RPGPlayer, RPGPlayerRepository } from '@/entities'
import { Database } from '@/services'

import { NarrativeEngine } from './NarrativeEngine'
import { QuestManager } from './QuestManager'
import { WorldManager } from './WorldManager'

@Service()
export class RPGService {

	constructor(
		@inject(delay(() => Database)) private db: Database,
		@inject(delay(() => WorldManager)) private worldManager: WorldManager,
		@inject(delay(() => QuestManager)) private questManager: QuestManager,
		@inject(delay(() => NarrativeEngine)) private narrativeEngine: NarrativeEngine
	) {}

	private get playerRepo(): RPGPlayerRepository {
		return this.db.get(RPGPlayer) as RPGPlayerRepository
	}

	async getPlayer(userId: string, discordGuildId: string): Promise<RPGPlayer> {
		return this.playerRepo.findOrCreate(userId, discordGuildId)
	}

	async movePlayer(userId: string, discordGuildId: string, locationId: string): Promise<{ success: boolean, message: string }> {
		const player = await this.getPlayer(userId, discordGuildId)
		const currentRoom = this.worldManager.getRoom(player.currentLocation)
		const targetRoom = this.worldManager.getRoom(locationId)

		if (!targetRoom) {
			return { success: false, message: 'Lieu inconnu.' }
		}

		if (!currentRoom?.connections.includes(locationId)) {
			return { success: false, message: 'Vous ne pouvez pas vous rendre directement ici.' }
		}

		player.currentLocation = locationId
		await this.db.em.persistAndFlush(player)

		return { success: true, message: `Vous êtes maintenant à ${targetRoom.name}.` }
	}

	async getExploreInfo(userId: string, discordGuildId: string) {
		const player = await this.getPlayer(userId, discordGuildId)
		const room = this.worldManager.getRoom(player.currentLocation)

		return { player, room }
	}

	getDialogue(npcId: string, nodeId: string) {
		return this.narrativeEngine.getDialogue(npcId, nodeId)
	}

}

import { Collection, Entity, EntityRepositoryType, Index, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from './BaseEntity'
import { RPGItem } from './RPGItem'
import { RPGNarrativeState } from './RPGNarrativeState'
import { RPGQuest } from './RPGQuest'

@Entity({ repository: () => RPGPlayerRepository })
export class RPGPlayer extends CustomBaseEntity {

	[EntityRepositoryType]?: RPGPlayerRepository

	@PrimaryKey({ autoincrement: true })
	id!: number

	@Property()
	@Index()
	userId!: string

	@Property()
	@Index()
	discordGuildId!: string

	@Property()
	level: number = 1

	@Property()
	xp: number = 0

	@Property()
	jewels: number = 100

	@Property()
	hp: number = 100

	@Property()
	maxHp: number = 100

	@Property()
	mp: number = 50

	@Property()
	maxMp: number = 50

	@Property()
	currentLocation: string = 'magnolia' // Starting location

	@Property()
	context: 'exploration' | 'combat' | 'dialogue' | 'mission' = 'exploration'

	@OneToMany(() => RPGItem, item => item.player)
	inventory = new Collection<RPGItem>(this)

	@OneToMany(() => RPGQuest, quest => quest.player)
	quests = new Collection<RPGQuest>(this)

	@OneToMany(() => RPGNarrativeState, state => state.player)
	narrativeFlags = new Collection<RPGNarrativeState>(this)

}

export class RPGPlayerRepository extends EntityRepository<RPGPlayer> {

	async findOrCreate(userId: string, discordGuildId: string): Promise<RPGPlayer> {
		let player = await this.findOne({ userId, discordGuildId })
		if (!player) {
			player = this.create({
				userId,
				discordGuildId,
				level: 1,
				xp: 0,
				jewels: 100,
				hp: 100,
				maxHp: 100,
				mp: 50,
				maxMp: 50,
				currentLocation: 'magnolia',
				context: 'exploration',
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			await this.em.persistAndFlush(player)
		}

		return player
	}

}

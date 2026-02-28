import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from './BaseEntity'
import { RPGPlayer } from './RPGPlayer'

@Entity({ repository: () => RPGNarrativeStateRepository })
@Unique({ properties: ['player', 'flag'] })
export class RPGNarrativeState extends CustomBaseEntity {

	[EntityRepositoryType]?: RPGNarrativeStateRepository

	@PrimaryKey({ autoincrement: true })
	id!: number

	@Property()
	flag!: string

	@Property({ type: 'json' })
	value: any

	@ManyToOne(() => RPGPlayer)
	player!: RPGPlayer

}

export class RPGNarrativeStateRepository extends EntityRepository<RPGNarrativeState> {

	async setFlag(player: RPGPlayer, flag: string, value: any): Promise<void> {
		let state = await this.findOne({ player, flag })
		if (state) {
			state.value = value
		} else {
			state = this.create({ player, flag, value, createdAt: new Date(), updatedAt: new Date() })
		}
		await this.em.persistAndFlush(state)
	}

	async getFlag(player: RPGPlayer, flag: string): Promise<any> {
		const state = await this.findOne({ player, flag })

		return state?.value
	}

}

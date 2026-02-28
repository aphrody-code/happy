import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from './BaseEntity'
import { RPGPlayer } from './RPGPlayer'

@Entity({ repository: () => RPGQuestRepository })
export class RPGQuest extends CustomBaseEntity {

	[EntityRepositoryType]?: RPGQuestRepository

	@PrimaryKey({ autoincrement: true })
	id!: number

	@Property()
	questId!: string

	@Property()
	status: 'active' | 'completed' | 'failed' = 'active'

	@Property()
	currentStep: number = 0

	@Property({ type: 'json', nullable: true })
	data?: any

	@ManyToOne(() => RPGPlayer)
	player!: RPGPlayer

}

export class RPGQuestRepository extends EntityRepository<RPGQuest> {
}

import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from './BaseEntity'
import { RPGPlayer } from './RPGPlayer'

@Entity({ repository: () => RPGItemRepository })
export class RPGItem extends CustomBaseEntity {

	[EntityRepositoryType]?: RPGItemRepository

	@PrimaryKey({ autoincrement: true })
	id!: number

	@Property()
	itemId!: string

	@Property()
	name!: string

	@Property()
	quantity: number = 1

	@Property({ type: 'json', nullable: true })
	metadata?: any

	@ManyToOne(() => RPGPlayer)
	player!: RPGPlayer

}

export class RPGItemRepository extends EntityRepository<RPGItem> {
}

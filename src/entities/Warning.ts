import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core'

import { CustomBaseEntity } from './BaseEntity'

@Entity()
export class Warning extends CustomBaseEntity {

	@PrimaryKey({ autoincrement: true })
	id!: number

	@Property()
	@Index()
	discordGuildId!: string

	@Property()
	@Index()
	userId!: string

	@Property()
	moderatorId!: string

	@Property()
	reason!: string

	@Property()
	active: boolean = true

}

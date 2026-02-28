import { Entity, EntityRepositoryType, Index, PrimaryKey, Property } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

// ===========================================
// ================= Entity ==================
// ===========================================

@Entity({ repository: () => StatRepository })
@Index({ properties: ['type', 'createdAt'] })
export class Stat {

	[EntityRepositoryType]?: StatRepository

	@PrimaryKey()
    id: number

	@Property()
	@Index()
    type!: string

	@Property()
    value: string = ''

	@Property({ type: 'json', nullable: true })
    additionalData?: any

	@Property()
	@Index()
    createdAt: Date = new Date()

}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class StatRepository extends EntityRepository<Stat> {

}

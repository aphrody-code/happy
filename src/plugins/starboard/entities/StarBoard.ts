import { Entity, PrimaryKey, Property, EntityRepositoryType, IntegerType } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from '@/entities'

// ===========================================
// ================= Entité ==================
// ===========================================

@Entity({ repository: () => StarBoardRepository })
export class StarBoard extends CustomBaseEntity {

	[EntityRepositoryType]?: StarBoardRepository

	@PrimaryKey({ autoincrement: false })
	guildId!: string

	@Property()
	channelId!: string

	@Property({ default: '⭐' })
	emoji!: string

	@Property({ type: IntegerType })
	minStar: number = 3
}

// ===========================================
// ========== Repository Personnalisé ========
// ===========================================

export class StarBoardRepository extends EntityRepository<StarBoard> {}

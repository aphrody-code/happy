import { Entity, EntityRepositoryType, PrimaryKey, Property } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from './BaseEntity'

// ===========================================
// ================= Entité ==================
// ===========================================

@Entity({ repository: () => FairyTailGuildeRepository })
export class FairyTailGuilde extends CustomBaseEntity {

	[EntityRepositoryType]?: FairyTailGuildeRepository

	@PrimaryKey({ autoincrement: true })
	id!: number

	@Property()
	discordGuildId!: string

	@Property()
	userId!: string

	@Property()
	guildeId!: string

	@Property()
	roleId!: string

}

// ===========================================
// ========== Repository Personnalisé ========
// ===========================================

export class FairyTailGuildeRepository extends EntityRepository<FairyTailGuilde> {

	async findMembership(discordGuildId: string, userId: string): Promise<FairyTailGuilde | null> {
		return this.findOne({ discordGuildId, userId })
	}

	async countByGuilde(discordGuildId: string, guildeId: string): Promise<number> {
		return this.count({ discordGuildId, guildeId })
	}

	async getAllMembershipsForServer(discordGuildId: string): Promise<FairyTailGuilde[]> {
		return this.find({ discordGuildId })
	}

}

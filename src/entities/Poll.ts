import { Cascade, Collection, Entity, EntityRepositoryType, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from './BaseEntity'

// ===========================================
// ================= Entities ================
// ===========================================

@Entity({ repository: () => PollRepository })
export class Poll extends CustomBaseEntity {

	[EntityRepositoryType]?: PollRepository

	@PrimaryKey({ autoincrement: true })
    id!: number

	@Property()
    title!: string

	@Property({ type: 'text', nullable: true })
    description?: string

	@Property({ default: true })
    isActive: boolean = true

	@Property()
    guildId!: string

	@Property()
    creatorId!: string

	@Property({ default: false })
    allowMultiple: boolean = false

	@Property({ default: 1 })
    maxVotes: number = 1

	@Property({ nullable: true })
    expiresAt?: Date

	@OneToMany(() => PollOption, option => option.poll, { cascade: [Cascade.ALL] })
    options = new Collection<PollOption>(this)

}

@Entity()
export class PollOption extends CustomBaseEntity {

	@PrimaryKey({ autoincrement: true })
    id!: number

	@Property()
    label!: string

	@ManyToOne(() => Poll)
    poll!: Poll

	@OneToMany(() => PollVote, vote => vote.option, { cascade: [Cascade.ALL] })
    votes = new Collection<PollVote>(this)

}

@Entity()
@Unique({ properties: ['poll', 'userId', 'option'] })
export class PollVote extends CustomBaseEntity {

	@PrimaryKey({ autoincrement: true })
    id!: number

	@Property()
    userId!: string

	@ManyToOne(() => Poll)
    poll!: Poll

	@ManyToOne(() => PollOption)
    option!: PollOption

}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class PollRepository extends EntityRepository<Poll> {

	async getPollWithResults(pollId: number): Promise<Poll | null> {
		return this.findOne({ id: pollId }, { populate: ['options', 'options.votes'] })
	}

}

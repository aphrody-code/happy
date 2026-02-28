import { Entity, Enum, Index, PrimaryKey, Property } from '@mikro-orm/core'

import { CustomBaseEntity } from './BaseEntity'

export enum ModerationAction {
	BAN = 'ban',
	UNBAN = 'unban',
	KICK = 'kick',
	TIMEOUT = 'timeout',
	UNTIMEOUT = 'untimeout',
	WARN = 'warn',
	CLEAR = 'clear',
	SLOWMODE = 'slowmode',
	LOCK = 'lock',
	UNLOCK = 'unlock',
	ROLE_ADD = 'role_add',
	ROLE_REMOVE = 'role_remove',
	SOFTBAN = 'softban',
	NUKE = 'nuke',
	NICKNAME = 'nickname',
	DEAFEN = 'deafen',
	UNDEAFEN = 'undeafen',
	VMUTE = 'vmute',
	VUNMUTE = 'vunmute'
}

@Entity()
export class ModerationLog extends CustomBaseEntity {

	@PrimaryKey({ autoincrement: true })
	id!: number

	@Property()
	@Index()
	discordGuildId!: string

	@Enum(() => ModerationAction)
	action!: ModerationAction

	@Property()
	@Index()
	moderatorId!: string

	@Property()
	@Index()
	targetId!: string

	@Property({ nullable: true, type: 'string' })
	reason: string | null = null

	@Property({ nullable: true, type: 'number' })
	duration: number | null = null

	@Property({ nullable: true, type: 'json' })
	additionalData: Record<string, unknown> | null = null

}

import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, AttachmentBuilder, CommandInteraction, GuildMember } from 'discord.js'
import { Client } from 'discordx'

import { fairyTailGuildes } from '@/configs'
import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { FairyTailGuilde, RPGPlayer } from '@/entities'
import { Database } from '@/services'
import { resolveGuild } from '@/utils/functions'

import { generateProfileCard } from '../../libs/card'

@Discord()
@Injectable()
@Category('RPG')
export default class RankCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'rank',
		description: 'Affiche la carte de rang d\'un membre.',
	})
	async rank(
		@SlashOption({
			name: 'membre',
			description: 'Le membre dont afficher le rang.',
			type: ApplicationCommandOptionType.User,
		}) target: GuildMember | undefined,
		interaction: CommandInteraction,
		client: Client
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const member = target ?? interaction.member as GuildMember
		const user = member.user

		const repo = this.db.get(RPGPlayer) as import('@/entities').RPGPlayerRepository
		const player = await repo.findOrCreate(user.id, guild.id)

		const membership = await this.db.get(FairyTailGuilde).findMembership(guild.id, user.id)
		const guildeName = membership
			? fairyTailGuildes.find((g) => g.id === membership.guildeId)?.name
			: undefined

		const xpNeeded = player.level * 100

		const card = await generateProfileCard({
			username: member.displayName,
			avatarUrl: user.displayAvatarURL({ extension: 'png', size: 512 }),
			level: player.level,
			xp: player.xp,
			xpNeeded,
			jewels: player.jewels,
			hp: player.hp,
			maxHp: player.maxHp,
			mp: player.mp,
			maxMp: player.maxMp,
			location: player.currentLocation,
			guild: guildeName,
		})

		const attachment = new AttachmentBuilder(card, { name: 'rank.png' })
		interaction.followUp({ files: [attachment] })
	}

}

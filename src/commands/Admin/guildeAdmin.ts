import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from 'discord.js'
import { Client } from 'discordx'

import { fairyTailGuildes } from '@/configs'
import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { FairyTailGuilde } from '@/entities'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'
import { resolveGuild, simpleErrorEmbed, simpleSuccessEmbed } from '@/utils/functions'

@Discord()
@Injectable()
@Category('Admin')
export default class GuildeAdminCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'guilde-reset' })
	@Guard(
		UserPermissions(['Administrator'])
	)
	async guildeReset(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.GUILDE_RESET.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
			interaction: CommandInteraction,
			client: Client,
			{ localize }: InteractionData
	) {
		const discordGuild = resolveGuild(interaction)
		if (!discordGuild) return

		const repo = this.db.get(FairyTailGuilde) as InstanceType<typeof import('@/entities').FairyTailGuildeRepository>
		const membership = await repo.findMembership(discordGuild.id, member.id)

		if (!membership) {
			simpleErrorEmbed(
				interaction,
				localize.COMMANDS.GUILDE_RESET.NOT_IN_GUILD({ member: member.displayName })
			)

			return
		}

		const guildeConfig = fairyTailGuildes.find(g => g.id === membership.guildeId)

		// Retirer le rôle du membre
		try {
			const guildMember = await discordGuild.members.fetch(member.id)
			const role = discordGuild.roles.cache.get(membership.roleId)
			if (role) await guildMember.roles.remove(role)
		} catch { /* le rôle ou le membre peut ne plus exister */ }

		// Supprimer de la base de données
		await this.db.em.removeAndFlush(membership)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.GUILDE_RESET.SUCCESS({
				member: member.displayName,
				guilde: guildeConfig?.name ?? membership.guildeId,
			})
		)
	}

	@Slash({ name: 'guilde-reset-all' })
	@Guard(
		UserPermissions(['Administrator'])
	)
	async guildeResetAll(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const discordGuild = resolveGuild(interaction)
		if (!discordGuild) return

		const repo = this.db.get(FairyTailGuilde) as InstanceType<typeof import('@/entities').FairyTailGuildeRepository>
		const allMemberships = await repo.getAllMembershipsForServer(discordGuild.id)

		if (allMemberships.length === 0) {
			simpleErrorEmbed(
				interaction,
				localize.COMMANDS.GUILDE_RESET_ALL.NO_MEMBERSHIPS()
			)

			return
		}

		// Retirer tous les rôles de guilde des membres (avec délai pour éviter le rate limit)
		for (const membership of allMemberships) {
			try {
				const guildMember = await discordGuild.members.fetch(membership.userId)
				const role = discordGuild.roles.cache.get(membership.roleId)
				if (role) await guildMember.roles.remove(role)
				await new Promise(resolve => setTimeout(resolve, 300))
			} catch { /* le membre ou le rôle peut ne plus exister */ }
		}

		// Supprimer tout de la base de données
		const count = allMemberships.length
		await this.db.em.removeAndFlush(allMemberships)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.GUILDE_RESET_ALL.SUCCESS({ count })
		)
	}

}

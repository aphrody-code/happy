import { Category } from '@discordx/utilities'
import {
	ActionRowBuilder,
	ColorResolvable,
	CommandInteraction,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
} from 'discord.js'
import { Client, SelectMenuComponent } from 'discordx'

import { fairyTailGuildes } from '@/configs'
import { Discord, Injectable, Slash } from '@/decorators'
import { FairyTailGuilde } from '@/entities'
import { Guard } from '@/guards'
import { Database } from '@/services'
import { getColor, resolveGuild } from '@/utils/functions'

@Discord()
@Injectable()
@Category('Guilde')
export default class GuildeCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'guilde' })
	async guilde(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.GUILDE.EMBED.TITLE())
			.setDescription(localize.COMMANDS.GUILDE.EMBED.DESCRIPTION())
			.setColor(getColor('guildeDefault'))
			.setThumbnail(client.user?.displayAvatarURL() ?? null)

		const legalGuildes = fairyTailGuildes.filter(g => g.type === 'legale')
		const otherGuildes = fairyTailGuildes.filter(g => g.type !== 'legale')

		const legalMenu = new StringSelectMenuBuilder()
			.setCustomId('guilde-select-legal')
			.setPlaceholder(localize.COMMANDS.GUILDE.EMBED.LEGAL_LABEL())
			.addOptions(legalGuildes.map(g => ({
				label: g.name,
				value: g.id,
				description: g.description.substring(0, 100),
				emoji: g.emoji,
			})))

		const darkMenu = new StringSelectMenuBuilder()
			.setCustomId('guilde-select-dark')
			.setPlaceholder(localize.COMMANDS.GUILDE.EMBED.DARK_LABEL())
			.addOptions(otherGuildes.map(g => ({
				label: g.name,
				value: g.id,
				description: g.description.substring(0, 100),
				emoji: g.emoji,
			})))

		const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(legalMenu)
		const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(darkMenu)

		interaction.followUp({
			embeds: [embed],
			components: [row1, row2],
		})
	}

	@SelectMenuComponent({ id: 'guilde-select-legal' })
	async selectLegalGuilde(interaction: StringSelectMenuInteraction, client: Client, { localize }: InteractionData) {
		await this.handleGuildeSelection(interaction, client, localize)
	}

	@SelectMenuComponent({ id: 'guilde-select-dark' })
	async selectDarkGuilde(interaction: StringSelectMenuInteraction, client: Client, { localize }: InteractionData) {
		await this.handleGuildeSelection(interaction, client, localize)
	}

	private async handleGuildeSelection(
		interaction: StringSelectMenuInteraction,
		client: Client,
		localize: InteractionData['localize']
	) {
		const guildeId = interaction.values[0]
		const guildeConfig = fairyTailGuildes.find(g => g.id === guildeId)
		if (!guildeConfig) return

		const discordGuild = resolveGuild(interaction)
		if (!discordGuild) return

		const member = await discordGuild.members.fetch(interaction.user.id)
		const repo = this.db.get(FairyTailGuilde) as InstanceType<typeof import('@/entities').FairyTailGuildeRepository>

		// Vérifier l'adhésion actuelle
		const currentMembership = await repo.findMembership(discordGuild.id, interaction.user.id)

		if (currentMembership && currentMembership.guildeId === guildeId) {
			const embed = new EmbedBuilder()
				.setColor(0xED4245)
				.setTitle(`❌ ${localize.COMMANDS.GUILDE.ALREADY_IN_GUILD({ guilde: guildeConfig.name })}`)

			await interaction.reply({ embeds: [embed], ephemeral: true })
			return
		}

		try {
			// Retirer l'ancien rôle si existant
			let oldGuildeName: string | null = null
			if (currentMembership) {
				const oldConfig = fairyTailGuildes.find(g => g.id === currentMembership.guildeId)
				oldGuildeName = oldConfig?.name ?? null

				try {
					const oldRole = discordGuild.roles.cache.get(currentMembership.roleId)
					if (oldRole) await member.roles.remove(oldRole)
				} catch { /* le rôle a peut-être été supprimé */ }
			}

			// Trouver ou créer le rôle de guilde
			const roleName = `Guilde ${guildeConfig.name}`
			let role = discordGuild.roles.cache.find(r => r.name === roleName)

			if (!role) {
				role = await discordGuild.roles.create({
					name: roleName,
					color: guildeConfig.color as ColorResolvable,
					reason: `Rôle de guilde Fairy Tail: ${guildeConfig.name}`,
				})
			}

			// Attribuer le nouveau rôle
			await member.roles.add(role)

			// Sauvegarder en base de données
			if (currentMembership) {
				currentMembership.guildeId = guildeId
				currentMembership.roleId = role.id
				await this.db.em.flush()
			} else {
				const membership = new FairyTailGuilde()
				membership.discordGuildId = discordGuild.id
				membership.userId = interaction.user.id
				membership.guildeId = guildeId
				membership.roleId = role.id
				await this.db.em.persistAndFlush(membership)
			}

			// Embed de confirmation
			const embed = new EmbedBuilder()
				.setColor(guildeConfig.color as ColorResolvable)
				.setThumbnail(interaction.user.displayAvatarURL())

			if (oldGuildeName) {
				embed
					.setTitle(localize.COMMANDS.GUILDE.CHANGED.TITLE())
					.setDescription(localize.COMMANDS.GUILDE.CHANGED.DESCRIPTION({
						oldGuilde: oldGuildeName,
						newGuilde: guildeConfig.name,
					}))
			} else {
				embed
					.setTitle(localize.COMMANDS.GUILDE.SUCCESS.TITLE({ guilde: guildeConfig.name }))
					.setDescription(localize.COMMANDS.GUILDE.SUCCESS.DESCRIPTION({ guilde: guildeConfig.name }))
			}

			await interaction.reply({ embeds: [embed], ephemeral: true })
		} catch {
			const embed = new EmbedBuilder()
				.setColor(0xED4245)
				.setTitle(`❌ ${localize.COMMANDS.GUILDE.ERROR()}`)

			await interaction.reply({ embeds: [embed], ephemeral: true })
		}
	}

}

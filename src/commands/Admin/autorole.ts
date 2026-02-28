import { Category } from '@discordx/utilities'
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ChannelType,
	CommandInteraction,
	EmbedBuilder,
	Role,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	TextChannel,
} from 'discord.js'
import { Client, SelectMenuComponent } from 'discordx'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { Guard, UserPermissions } from '@/guards'

@Discord()
@Injectable()
@Category('Admin')
export default class AutoRoleCommand {

	@Slash({
		name: 'autorole',
		description: 'Créer un message d\'auto-attribution de rôles.',
	})
	@Guard(
		UserPermissions(['ManageRoles'])
	)
	async autorole(
		@SlashOption({
			name: 'titre',
			description: 'Le titre de l\'embed.',
			type: ApplicationCommandOptionType.String,
			required: true,
		}) title: string,
		@SlashOption({
			name: 'role1',
			description: 'Premier rôle.',
			type: ApplicationCommandOptionType.Role,
			required: true,
		}) role1: Role,
		@SlashOption({
			name: 'role2',
			description: 'Deuxième rôle.',
			type: ApplicationCommandOptionType.Role,
		}) role2: Role | undefined,
		@SlashOption({
			name: 'role3',
			description: 'Troisième rôle.',
			type: ApplicationCommandOptionType.Role,
		}) role3: Role | undefined,
		@SlashOption({
			name: 'role4',
			description: 'Quatrième rôle.',
			type: ApplicationCommandOptionType.Role,
		}) role4: Role | undefined,
		@SlashOption({
			name: 'role5',
			description: 'Cinquième rôle.',
			type: ApplicationCommandOptionType.Role,
		}) role5: Role | undefined,
		@SlashOption({
			name: 'role6',
			description: 'Sixième rôle.',
			type: ApplicationCommandOptionType.Role,
		}) role6: Role | undefined,
		@SlashOption({
			name: 'role7',
			description: 'Septième rôle.',
			type: ApplicationCommandOptionType.Role,
		}) role7: Role | undefined,
		@SlashOption({
			name: 'role8',
			description: 'Huitième rôle.',
			type: ApplicationCommandOptionType.Role,
		}) role8: Role | undefined,
		@SlashOption({
			name: 'description',
			description: 'Description de l\'embed.',
			type: ApplicationCommandOptionType.String,
		}) description: string | undefined,
		@SlashOption({
			name: 'salon',
			description: 'Salon où envoyer le message.',
			type: ApplicationCommandOptionType.Channel,
		}) channel: TextChannel | undefined,
		interaction: CommandInteraction,
		client: Client
	) {
		const roles = [role1, role2, role3, role4, role5, role6, role7, role8].filter(Boolean) as Role[]

		const targetChannel = channel ?? interaction.channel
		if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
			return interaction.followUp({ content: 'Salon invalide.', ephemeral: true })
		}

		const embed = new EmbedBuilder()
			.setColor(0xE8672A)
			.setTitle(title)
			.setDescription(
				(description ?? 'Sélectionnez vos rôles dans le menu ci-dessous.') +
				'\n\n' +
				roles.map(r => `${r.toString()}`).join(' • ')
			)

		const menu = new StringSelectMenuBuilder()
			.setCustomId('autorole-select')
			.setPlaceholder('Choisir un rôle...')
			.setMinValues(0)
			.setMaxValues(roles.length)
			.addOptions(roles.map(r => ({
				label: r.name,
				value: r.id,
			})))

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)

		await (targetChannel as TextChannel).send({
			embeds: [embed],
			components: [row],
		})

		interaction.followUp({
			content: `Message d'auto-rôle envoyé dans ${targetChannel.toString()}.`,
			ephemeral: true,
		})
	}

	@SelectMenuComponent({ id: 'autorole-select' })
	async handleAutoRole(interaction: StringSelectMenuInteraction, client: Client) {
		const guild = interaction.guild
		if (!guild) return

		const member = await guild.members.fetch(interaction.user.id)
		const selectedRoleIds = interaction.values

		// Récupérer tous les rôles disponibles dans ce menu
		const menuOptions = interaction.component.options
		const allRoleIds = menuOptions.map(o => o.value)

		const added: string[] = []
		const removed: string[] = []

		for (const roleId of allRoleIds) {
			const role = guild.roles.cache.get(roleId)
			if (!role) continue

			if (selectedRoleIds.includes(roleId)) {
				if (!member.roles.cache.has(roleId)) {
					await member.roles.add(role).catch(() => {})
					added.push(role.name)
				}
			} else {
				if (member.roles.cache.has(roleId)) {
					await member.roles.remove(role).catch(() => {})
					removed.push(role.name)
				}
			}
		}

		const parts: string[] = []
		if (added.length > 0) parts.push(`**+** ${added.join(', ')}`)
		if (removed.length > 0) parts.push(`**-** ${removed.join(', ')}`)

		await interaction.reply({
			content: parts.length > 0
				? `Rôles mis à jour :\n${parts.join('\n')}`
				: 'Aucun changement.',
			ephemeral: true,
		})
	}

}

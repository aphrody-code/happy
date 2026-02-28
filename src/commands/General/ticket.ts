import { Category } from '@discordx/utilities'
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelType,
	CommandInteraction,
	EmbedBuilder,
	OverwriteType,
	PermissionFlagsBits,
	TextChannel,
} from 'discord.js'
import { ButtonComponent, Client } from 'discordx'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'

@Discord()
@Injectable()
@Category('General')
export default class TicketCommand {

	@Slash({
		name: 'ticket',
		description: 'Ouvrir un ticket de support.',
	})
	async ticket(
		@SlashOption({
			name: 'sujet',
			description: 'Le sujet de votre ticket.',
			type: ApplicationCommandOptionType.String,
			required: true,
		}) subject: string,
		interaction: CommandInteraction,
		client: Client
	) {
		const guild = interaction.guild
		if (!guild) return

		// Vérifier qu'il n'y a pas déjà un ticket ouvert
		const existingTicket = guild.channels.cache.find(
			c => c.name === `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`
		)

		if (existingTicket) {
			return interaction.followUp({
				content: `Tu as déjà un ticket ouvert : ${existingTicket.toString()}`,
				ephemeral: true,
			})
		}

		// Trouver ou créer la catégorie "Tickets"
		let category = guild.channels.cache.find(
			c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('ticket')
		)

		if (!category) {
			category = await guild.channels.create({
				name: 'Tickets',
				type: ChannelType.GuildCategory,
				permissionOverwrites: [
					{
						id: guild.id,
						deny: [PermissionFlagsBits.ViewChannel],
						type: OverwriteType.Role,
					},
				],
			})
		}

		// Créer le salon du ticket
		const sanitizedName = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')
		const ticketChannel = await guild.channels.create({
			name: `ticket-${sanitizedName}`,
			type: ChannelType.GuildText,
			parent: category.id,
			permissionOverwrites: [
				{
					id: guild.id,
					deny: [PermissionFlagsBits.ViewChannel],
					type: OverwriteType.Role,
				},
				{
					id: interaction.user.id,
					allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
					type: OverwriteType.Member,
				},
				{
					id: client.user!.id,
					allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
					type: OverwriteType.Member,
				},
			],
		})

		// Donner accès aux rôles staff/modérateur
		const staffRoles = guild.roles.cache.filter(r =>
			r.permissions.has(PermissionFlagsBits.ManageMessages) && !r.managed && r.id !== guild.id
		)
		for (const [, role] of staffRoles) {
			await ticketChannel.permissionOverwrites.create(role, {
				ViewChannel: true,
				SendMessages: true,
			}).catch(() => {})
		}

		const embed = new EmbedBuilder()
			.setColor(0xE8672A)
			.setTitle(`Ticket de ${interaction.user.displayName}`)
			.setDescription(
				`**Sujet :** ${subject}\n\n` +
				`Un membre du staff va prendre en charge ton ticket.\n` +
				`Clique sur le bouton ci-dessous pour fermer le ticket quand c'est résolu.`
			)
			.setTimestamp()

		const closeButton = new ButtonBuilder()
			.setCustomId('ticket-close')
			.setLabel('Fermer le ticket')
			.setStyle(ButtonStyle.Danger)

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton)

		await ticketChannel.send({
			content: interaction.user.toString(),
			embeds: [embed],
			components: [row],
		})

		interaction.followUp({
			content: `Ticket créé : ${ticketChannel.toString()}`,
			ephemeral: true,
		})
	}

	@ButtonComponent({ id: 'ticket-close' })
	async closeTicket(interaction: ButtonInteraction, client: Client) {
		const channel = interaction.channel as TextChannel
		if (!channel.name.startsWith('ticket-')) return

		const guild = interaction.guild
		if (!guild) return

		// Seul le créateur du ticket ou un membre du staff peut fermer
		const isStaff = (interaction.member as any)?.permissions?.has?.(PermissionFlagsBits.ManageMessages)
		const isOwner = channel.name.includes(interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, ''))

		if (!isStaff && !isOwner) {
			return interaction.reply({ content: 'Tu n\'as pas la permission de fermer ce ticket.', ephemeral: true })
		}

		const embed = new EmbedBuilder()
			.setColor(0x95A5A6)
			.setDescription(`Ticket fermé par ${interaction.user.toString()}. Ce salon sera supprimé dans 10 secondes.`)

		await interaction.update({ components: [] })
		await channel.send({ embeds: [embed] })

		setTimeout(async () => {
			await channel.delete('Ticket fermé').catch(() => {})
		}, 10000)
	}

}

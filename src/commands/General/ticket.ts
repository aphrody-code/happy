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
	GuildBasedChannel,
	GuildMember,
	ModalBuilder,
	ModalSubmitInteraction,
	OverwriteType,
	PermissionFlagsBits,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	TextChannel,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js'
import { ButtonComponent, Client, ModalComponent, SelectMenuComponent, Slash, SlashOption } from 'discordx'

import { CATEGORY_NAMES, CHANNEL_NAMES } from '@/configs'
import { Discord, Guard, Injectable } from '@/decorators'
import { UserPermissions } from '@/guards'

// ── Types de tickets ──

const TICKET_TYPES = [
	{ id: 'support', label: 'Support', emoji: '❓', description: 'Aide générale sur le serveur ou le bot' },
	{ id: 'bug', label: 'Bug Report', emoji: '🐛', description: 'Signaler un bug du bot ou du serveur' },
	{ id: 'plainte', label: 'Plainte', emoji: '⚖️', description: 'Signaler un membre ou un problème' },
	{ id: 'suggestion', label: 'Suggestion', emoji: '💡', description: 'Proposer une idée ou amélioration' },
] as const

type TicketTypeId = typeof TICKET_TYPES[number]['id']

@Discord()
@Injectable()
@Category('General')
export default class TicketCommand {

	// ═══════════════════════════════════════════
	// /ticket-setup — Poste le panneau de tickets
	// ═══════════════════════════════════════════

	@Slash({
		name: 'ticket-setup',
		description: 'Poste le panneau de tickets dans ce salon.',
	})
	@Guard(UserPermissions(['Administrator']))
	async ticketSetup(
		@SlashOption({
			name: 'salon',
			description: 'Salon où poster le panneau.',
			type: ApplicationCommandOptionType.Channel,
			required: false,
		}) channel: TextChannel | undefined,
		interaction: CommandInteraction,
		client: Client
	) {
		const targetChannel = (channel ?? interaction.channel) as TextChannel
		if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
			return interaction.followUp({ content: 'Salon textuel invalide.', ephemeral: true })
		}

		const embed = new EmbedBuilder()
			.setColor(0xE8672A)
			.setTitle('🎫 Système de Tickets')
			.setDescription(
				'Besoin d\'aide ? Un problème à signaler ?\n\n'
				+ 'Clique sur le bouton ci-dessous pour ouvrir un ticket.\n'
				+ 'Un membre du staff prendra en charge ta demande.'
			)
			.setFooter({ text: 'Un seul ticket ouvert à la fois par membre.' })

		const button = new ButtonBuilder()
			.setCustomId('ticket-open')
			.setLabel('Ouvrir un ticket')
			.setEmoji('🎫')
			.setStyle(ButtonStyle.Primary)

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)

		await targetChannel.send({ embeds: [embed], components: [row] })
		await interaction.followUp({ content: `Panneau de tickets posté dans ${targetChannel.toString()}.`, ephemeral: true })
	}

	// ═══════════════════════════════════════════
	// /ticket — Commande slash directe
	// ═══════════════════════════════════════════

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
		await this.createTicket(interaction.guild!, interaction.user, subject, 'support', interaction, client)
	}

	// ═══════════════════════════════════════════
	// Bouton "Ouvrir un ticket" → Menu de type
	// ═══════════════════════════════════════════

	@ButtonComponent({ id: 'ticket-open' })
	async handleOpenButton(interaction: ButtonInteraction) {
		const menu = new StringSelectMenuBuilder()
			.setCustomId('ticket-type')
			.setPlaceholder('Choisis le type de ticket...')
			.addOptions(TICKET_TYPES.map(t => ({
				label: t.label,
				value: t.id,
				emoji: t.emoji,
				description: t.description,
			})))

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)

		await interaction.reply({
			content: 'Quel type de ticket souhaites-tu ouvrir ?',
			components: [row],
			ephemeral: true,
		})
	}

	// ═══════════════════════════════════════════
	// Menu de type → Modal avec sujet
	// ═══════════════════════════════════════════

	@SelectMenuComponent({ id: 'ticket-type' })
	async handleTypeSelect(interaction: StringSelectMenuInteraction) {
		const ticketType = interaction.values[0] as TicketTypeId

		const modal = new ModalBuilder()
			.setCustomId(`ticket-modal-${ticketType}`)
			.setTitle('Ouvrir un ticket')

		const subjectInput = new TextInputBuilder()
			.setCustomId('ticket-subject')
			.setLabel('Sujet')
			.setPlaceholder('Décris brièvement ton problème...')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setMaxLength(100)

		const detailInput = new TextInputBuilder()
			.setCustomId('ticket-detail')
			.setLabel('Détails (optionnel)')
			.setPlaceholder('Plus de détails si nécessaire...')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(false)
			.setMaxLength(1000)

		modal.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(subjectInput),
			new ActionRowBuilder<TextInputBuilder>().addComponents(detailInput),
		)

		await interaction.showModal(modal)
	}

	// ═══════════════════════════════════════════
	// Modal → Création du ticket
	// ═══════════════════════════════════════════

	@ModalComponent({ id: /^ticket-modal-/ })
	async handleModal(interaction: ModalSubmitInteraction, client: Client) {
		const ticketType = interaction.customId.replace('ticket-modal-', '') as TicketTypeId
		const subject = interaction.fields.getTextInputValue('ticket-subject')
		const detail = interaction.fields.getTextInputValue('ticket-detail')

		await this.createTicket(interaction.guild!, interaction.user, subject, ticketType, interaction, client, detail)
	}

	// ═══════════════════════════════════════════
	// Bouton "Fermer le ticket"
	// ═══════════════════════════════════════════

	@ButtonComponent({ id: /^ticket-close-/ })
	async handleTicketClose(interaction: ButtonInteraction, client: Client) {
		const channel = interaction.channel as TextChannel
		if (!channel?.name.startsWith('ticket-')) return

		const guild = interaction.guild
		if (!guild) return

		const member = interaction.member as GuildMember
		const isStaff = member.permissions.has(PermissionFlagsBits.ManageMessages)
		const isCreator = channel.permissionOverwrites.cache.some(
			p => p.id === interaction.user.id && p.type === OverwriteType.Member && p.allow.has(PermissionFlagsBits.ViewChannel)
		)

		if (!isStaff && !isCreator) {
			return interaction.reply({ content: 'Tu n\'as pas la permission de fermer ce ticket.', ephemeral: true })
		}

		// Générer le transcript
		let transcript = `Transcript du ticket #${channel.name}\n`
		transcript += `Fermé par : ${interaction.user.displayName}\n`
		transcript += `Date : ${new Date().toLocaleString('fr-FR')}\n`
		transcript += `${'─'.repeat(50)}\n\n`

		try {
			const messages = await channel.messages.fetch({ limit: 100 })
			const sorted = [...messages.values()].reverse()
			for (const msg of sorted) {
				const time = msg.createdAt.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
				transcript += `[${time}] ${msg.author.displayName}: ${msg.content || '(embed/fichier)'}\n`
				if (msg.attachments.size > 0) {
					transcript += `  Pièces jointes: ${msg.attachments.map(a => a.url).join(', ')}\n`
				}
			}
		} catch {
			transcript += '(Impossible de récupérer les messages)\n'
		}

		// Envoyer le transcript dans #logs
		const logChannel = guild.channels.cache.find(
			(c: GuildBasedChannel): c is TextChannel => c.type === ChannelType.GuildText && c.name === CHANNEL_NAMES.LOGS
		)

		if (logChannel) {
			const { AttachmentBuilder } = await import('discord.js')
			const file = new AttachmentBuilder(Buffer.from(transcript, 'utf-8'), { name: `${channel.name}-transcript.txt` })

			const logEmbed = new EmbedBuilder()
				.setColor(0x95A5A6)
				.setTitle(`Ticket fermé : #${channel.name}`)
				.setDescription(`Fermé par ${interaction.user.toString()}`)
				.setTimestamp()

			await logChannel.send({ embeds: [logEmbed], files: [file] }).catch(() => {})
		}

		await interaction.update({ components: [] })

		const closeEmbed = new EmbedBuilder()
			.setColor(0x95A5A6)
			.setDescription(`Ticket fermé par ${interaction.user.toString()}.\nCe salon sera supprimé dans **30 secondes**.`)

		await channel.send({ embeds: [closeEmbed] })

		setTimeout(async () => {
			await channel.delete('Ticket fermé').catch(() => {})
		}, 30000)
	}

	// ═══════════════════════════════════════════
	// Logique commune de création de ticket
	// ═══════════════════════════════════════════

	private async createTicket(
		guild: CommandInteraction['guild'] & object,
		user: CommandInteraction['user'],
		subject: string,
		type: TicketTypeId,
		interaction: CommandInteraction | ModalSubmitInteraction,
		client: Client,
		detail?: string,
	) {
		const sanitizedName = user.username.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 20)
		const existingTicket = guild.channels.cache.find(
			c => c.name === `ticket-${sanitizedName}` && c.type === ChannelType.GuildText
		)

		if (existingTicket) {
			return interaction.reply({
				content: `Tu as déjà un ticket ouvert : ${existingTicket.toString()}`,
				ephemeral: true,
			})
		}

		// Trouver ou créer la catégorie Tickets
		let category = guild.channels.cache.find(
			c => c.type === ChannelType.GuildCategory && c.name === CATEGORY_NAMES.TICKETS
		)

		if (!category) {
			try {
				category = await guild.channels.create({
					name: CATEGORY_NAMES.TICKETS,
					type: ChannelType.GuildCategory,
					permissionOverwrites: [{
						id: guild.id,
						deny: [PermissionFlagsBits.ViewChannel],
						type: OverwriteType.Role,
					}],
				})
			} catch {
				return interaction.reply({
					content: 'Impossible de créer la catégorie Tickets. Vérifie mes permissions.',
					ephemeral: true,
				})
			}
		}

		// Créer le salon
		let ticketChannel: TextChannel
		try {
			ticketChannel = await guild.channels.create({
				name: `ticket-${sanitizedName}`,
				type: ChannelType.GuildText,
				parent: category.id,
				topic: `${TICKET_TYPES.find(t => t.id === type)?.emoji ?? '🎫'} ${subject} — ${user.displayName}`,
				permissionOverwrites: [
					{
						id: guild.id,
						deny: [PermissionFlagsBits.ViewChannel],
						type: OverwriteType.Role,
					},
					{
						id: user.id,
						allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles],
						type: OverwriteType.Member,
					},
					{
						id: client.user!.id,
						allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages],
						type: OverwriteType.Member,
					},
				],
			})
		} catch {
			return interaction.reply({
				content: 'Impossible de créer le salon de ticket. Vérifie mes permissions.',
				ephemeral: true,
			})
		}

		// Donner accès aux rôles staff
		const staffRoles = guild.roles.cache.filter(r =>
			r.permissions.has(PermissionFlagsBits.ManageMessages) && !r.managed && r.id !== guild.id
		)
		for (const [, role] of staffRoles) {
			await ticketChannel.permissionOverwrites.create(role, {
				ViewChannel: true,
				SendMessages: true,
			}).catch(() => {})
		}

		// Embed d'ouverture
		const typeInfo = TICKET_TYPES.find(t => t.id === type)

		const embed = new EmbedBuilder()
			.setColor(0xE8672A)
			.setTitle(`${typeInfo?.emoji ?? '🎫'} ${typeInfo?.label ?? 'Ticket'} — ${subject}`)
			.setDescription(
				`**Créé par :** ${user.toString()}\n`
				+ `**Type :** ${typeInfo?.label ?? type}\n`
				+ `**Sujet :** ${subject}\n`
				+ (detail ? `\n**Détails :**\n${detail}\n` : '')
				+ `\nUn membre du staff va prendre en charge ton ticket.\n`
				+ `Décris ton problème en détail ci-dessous.`
			)
			.setTimestamp()

		const closeButton = new ButtonBuilder()
			.setCustomId(`ticket-close-${ticketChannel.id}`)
			.setLabel('Fermer le ticket')
			.setStyle(ButtonStyle.Danger)
			.setEmoji('🔒')

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton)

		await ticketChannel.send({
			content: user.toString(),
			embeds: [embed],
			components: [row],
		})

		await interaction.reply({
			content: `Ticket créé : ${ticketChannel.toString()}`,
			ephemeral: true,
		})
	}

}

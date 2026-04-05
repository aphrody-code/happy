import { Category } from '@discordx/utilities'
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
} from 'discord.js'
import { ButtonComponent, Client, SelectMenuComponent, Slash, SlashOption } from 'discordx'

import { Discord, Injectable } from '@/decorators'
import { Poll } from '@/entities'
import { PollService } from '@/services'
import { getColor } from '@/utils/functions'

@Discord()
@Injectable()
@Category('General')
export default class PollCommand {

	constructor(
		private pollService: PollService
	) {}

	@Slash({
		name: 'sondage',
		description: 'Créer un sondage pour le serveur.',
	})
	async poll(
		@SlashOption({
			name: 'titre',
			description: 'Le titre du sondage',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
		title: string,
		@SlashOption({
			name: 'options',
			description: 'Les options séparées par un point-virgule (ex: Natsu;Grey;Lucy)',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
		optionsStr: string,
		@SlashOption({
			name: 'description',
			description: 'Une description optionnelle',
			type: ApplicationCommandOptionType.String,
			required: false,
		})
		description: string | undefined,
		@SlashOption({
			name: 'plusieurs_choix',
			description: 'Permettre de voter pour plusieurs options ?',
			type: ApplicationCommandOptionType.Boolean,
			required: false,
		})
		allowMultiple: boolean = false,
		@SlashOption({
			name: 'max_votes',
			description: 'Nombre maximum de votes par utilisateur (si plusieurs choix)',
			type: ApplicationCommandOptionType.Integer,
			required: false,
		})
		maxVotes: number = 1,
		@SlashOption({
			name: 'duree',
			description: 'Durée du sondage en minutes (ex: 60 pour 1h)',
			type: ApplicationCommandOptionType.Integer,
			required: false,
		})
		duration: number | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const options = optionsStr.split(';').map(o => o.trim()).filter(o => o.length > 0)

		if (options.length < 2) {
			return interaction.followUp({ content: localize.COMMANDS.POLL.ERRORS.MIN_OPTIONS(), ephemeral: true })
		}

		if (options.length > 25) {
			return interaction.followUp({ content: localize.COMMANDS.POLL.ERRORS.MAX_OPTIONS(), ephemeral: true })
		}

		try {
			const poll = await this.pollService.create(
				interaction.guildId!,
				interaction.user.id,
				title,
				options,
				description,
				allowMultiple,
				maxVotes,
				duration
			)

			const embed = this.createPollEmbed(poll, 0, interaction.user.username, localize)

			const menu = new StringSelectMenuBuilder()
				.setCustomId(`poll-vote-${poll.id}`)
				.setPlaceholder(localize.COMMANDS.POLL.SELECT_MENU.PLACEHOLDER())
				.addOptions(poll.options.getItems().map(o => ({
					label: o.label,
					value: o.id.toString(),
				})))
				.setMaxValues(allowMultiple ? Math.min(maxVotes, options.length) : 1)

			const resultsButton = new ButtonBuilder()
				.setCustomId(`poll-results-${poll.id}`)
				.setLabel(localize.COMMANDS.POLL.BUTTONS.RESULTS())
				.setStyle(ButtonStyle.Secondary)

			const closeButton = new ButtonBuilder()
				.setCustomId(`poll-close-${poll.id}`)
				.setLabel(localize.COMMANDS.POLL.BUTTONS.CLOSE())
				.setStyle(ButtonStyle.Danger)

			const rowMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)
			const rowButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(resultsButton, closeButton)

			await interaction.followUp({
				embeds: [embed],
				components: [rowMenu, rowButtons],
			})
		} catch (error) {
			console.error(error)
			await interaction.followUp({ content: localize.COMMANDS.POLL.ERRORS.CREATION(), ephemeral: true })
		}
	}

	@SelectMenuComponent({ id: /^poll-vote-\d+$/ })
	async handleVote(interaction: StringSelectMenuInteraction, client: Client, { localize }: InteractionData) {
		const pollId = Number.parseInt(interaction.customId.split('-')[2])
		const pollEntity = await this.pollService.getById(pollId)
		if (!pollEntity) return

		// For multi-select, we need to handle values array
		// But here, the user selects values from a menu.
		// If they select multiple, we should process them.
		// Actually, our service `vote` method handles one option at a time.
		// If the menu allows multiple, we should loop or update the service.

		// For simplicity, let's process the first value if it's not multi-select,
		// or loop if it is. But wait, if they select 3 options in one go,
		// we should probably handle them all.

		for (const value of interaction.values) {
			const optionId = Number.parseInt(value)
			const result = await this.pollService.vote(pollId, interaction.user.id, optionId)

			if (!result.success) {
				const messages = {
					NOT_FOUND: localize.COMMANDS.POLL.ERRORS.NOT_FOUND(),
					CLOSED: localize.COMMANDS.POLL.ERRORS.CLOSED(),
					OPTION_NOT_FOUND: localize.COMMANDS.POLL.ERRORS.OPTION_NOT_FOUND(),
					ALREADY_VOTED: localize.COMMANDS.POLL.ERRORS.ALREADY_VOTED(),
					MAX_VOTES_REACHED: localize.COMMANDS.POLL.ERRORS.MAX_VOTES_REACHED({ max: pollEntity.maxVotes }),
				}

				// If error occurs, we stop and reply. If multiple selected, it might be weird.
				// But usually, they'll select what they can.
				return interaction.reply({ content: messages[result.type as keyof typeof messages], ephemeral: true })
			}
		}

		// Update the main embed to show total votes
		const results = await this.pollService.getResults(pollId)

		const creator = interaction.guild?.members.cache.get(pollEntity.creatorId)?.user.username || 'Inconnu'
		const embed = this.createPollEmbed(pollEntity, results.total, creator, localize)

		await interaction.update({ embeds: [embed] })

		await interaction.followUp({ content: localize.COMMANDS.POLL.SUCCESS.VOTE(), ephemeral: true })
	}

	@ButtonComponent({ id: /^poll-results-\d+$/ })
	async handleResults(interaction: ButtonInteraction, client: Client, { localize }: InteractionData) {
		const pollId = Number.parseInt(interaction.customId.split('-')[2])
		const poll = await this.pollService.getById(pollId)
		const results = await this.pollService.getResults(pollId)

		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.POLL.EMBED.RESULTS_TITLE({ title: poll?.title || 'Sondage' }))
			.setColor(getColor('primary'))

		const description = results.options
			.sort((a, b) => b.count - a.count)
			.map(o => `**${o.label}** : ${o.count} vote(s) (${o.percentage}%)`)
			.join('\n')

		embed.setDescription(description || localize.COMMANDS.POLL.EMBED.NO_VOTES())

		await interaction.reply({ embeds: [embed], ephemeral: true })
	}

	@ButtonComponent({ id: /^poll-close-\d+$/ })
	async handleClose(interaction: ButtonInteraction, client: Client, { localize }: InteractionData) {
		const pollId = Number.parseInt(interaction.customId.split('-')[2])
		const poll = await this.pollService.getById(pollId)

		if (!poll) return

		// Only creator or admin
		const isAdmin = interaction.memberPermissions?.has('Administrator')
		if (poll.creatorId !== interaction.user.id && !isAdmin) {
			return interaction.reply({ content: localize.COMMANDS.POLL.ERRORS.PERMISSION(), ephemeral: true })
		}

		await this.pollService.close(pollId)

		const embed = EmbedBuilder.from(interaction.message.embeds[0])
			.setTitle(`[FERMÉ] ${poll.title}`)
			.setColor(0xED4245)

		await interaction.update({ embeds: [embed], components: [] })
	}

	private createPollEmbed(poll: Poll, totalVotes: number, creatorName: string, localize: InteractionData['localize']) {
		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.POLL.EMBED.TITLE({ title: poll.title }))
			.setDescription(poll.description || null)
			.setColor(getColor('primary'))
			.setFooter({
				text: localize.COMMANDS.POLL.EMBED.FOOTER({ user: creatorName, total: totalVotes }),
			})

		if (poll.expiresAt) {
			const timestamp = Math.floor(poll.expiresAt.getTime() / 1000)
			embed.addFields({
				name: 'Fin du sondage',
				value: `Expire <t:${timestamp}:R>`,
				inline: false,
			})
		}

		return embed
	}

}

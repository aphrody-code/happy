import { Category } from '@discordx/utilities'
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
} from 'discord.js'
import { ButtonComponent, Client, Slash, SlashChoice, SlashOption } from 'discordx'

import { apiConfig } from '@/configs'
import { Discord, Injectable } from '@/decorators'
import { AnimeService, FancapsService } from '@/services'
import { getColor } from '@/utils/functions'

@Discord()
@Injectable()
@Category('General')
export default class AnimeCommand {

	constructor(
		private animeService: AnimeService,
		private fancapsService: FancapsService
	) {}

	@Slash({
		name: 'anime',
		description: 'Regarder un épisode de Fairy Tail',
	})
	async anime(
		@SlashChoice({ name: 'Fairy Tail (Saisons 1-9)', value: 'ft' })
		@SlashChoice({ name: 'Fairy Tail: 100 Years Quest', value: '100yq' })
		@SlashOption({
			name: 'serie',
			description: 'La série Fairy Tail',
			type: ApplicationCommandOptionType.String,
			required: true,
		})
		showPrefix: 'ft' | '100yq',
		@SlashOption({
			name: 'episode',
			description: 'Numéro de l\'épisode',
			type: ApplicationCommandOptionType.Integer,
			required: true,
			minValue: 1,
		})
		episodeNumber: number,
		@SlashChoice({ name: 'Source 1 (Sibnet/Sendvid)', value: 'source1' })
		@SlashChoice({ name: 'Source 2 (Vidmoly)', value: 'vidmoly' })
		@SlashChoice({ name: 'Source 3 (OneUpload)', value: 'oneupload' })
		@SlashOption({
			name: 'source',
			description: 'Source vidéo (lecteur)',
			type: ApplicationCommandOptionType.String,
			required: false,
		})
		sourceKey: string = 'source1',
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		// deferReply() is handled globally by automaticDeferring

		const episode = this.animeService.getEpisode(showPrefix, episodeNumber)

		if (!episode) {
			const total = this.animeService.getTotalEpisodes(showPrefix)

			return interaction.followUp({
				content: localize.COMMANDS.ANIME.ERRORS.NOT_FOUND({ episode: episodeNumber, total }),
			})
		}

		// Source mapping
		let finalLink: string | null = null
		if (sourceKey === 'source1') {
			// Fast path: pre-resolved MP4 link (instant, no network call)
			finalLink = this.animeService.getDirectMp4(showPrefix, episodeNumber)
			// Fallback: resolve at runtime from embed URL
			if (!finalLink) {
				const rawLink = episode.sources.sibnet || episode.sources.sendvid
				if (rawLink) {
					finalLink = await this.animeService.resolveDirectLink(rawLink) || rawLink
				}
			}
		} else {
			finalLink = episode.sources[sourceKey]
		}

		if (!finalLink) {
			return interaction.followUp({
				content: localize.COMMANDS.ANIME.ERRORS.LINK_NOT_FOUND({ episode: episodeNumber, source: sourceKey }),
			})
		}

		const title = episode.title_ja
			? `📺 ${episode.show} #${episode.number} — ${episode.title}`
			: `📺 ${episode.show} #${episode.number} — ${episode.title}`

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(
				(episode.title_ja ? `***${episode.title_ja}***\n\n` : '')
				+ localize.COMMANDS.ANIME.EMBED.DESCRIPTION({ link: finalLink, source: sourceKey })
			)
			.setColor(getColor('primary'))

		// Show episode thumbnail if available
		if (episode.thumbnail) {
			embed.setThumbnail(episode.thumbnail)
		}

		const row = new ActionRowBuilder<ButtonBuilder>()

		const watchUrl = `${apiConfig.baseUrl}/watch/${episode.id}`
		const watchButton = new ButtonBuilder()
			.setLabel('▶️ Regarder')
			.setURL(watchUrl)
			.setStyle(ButtonStyle.Link)

		row.addComponents(watchButton)

		// Add thumbnail button for random image from the same episode
		const thumb = this.fancapsService.getRandomThumbnail(showPrefix, episodeNumber)
		if (thumb) {
			const frameButton = new ButtonBuilder()
				.setCustomId(`anime-frame-${showPrefix}-${episodeNumber}`)
				.setLabel('🖼️ Image')
				.setStyle(ButtonStyle.Secondary)
			row.addComponents(frameButton)
		}

		await interaction.followUp({ embeds: [embed], components: [row] })
	}

	@ButtonComponent({ id: /^anime-frame-.+$/ })
	async handleAnimeFrame(interaction: ButtonInteraction, client: Client, { localize }: InteractionData) {
		// Format: anime-frame-{prefix}-{number}
		const parts = interaction.customId.replace('anime-frame-', '').split('-')
		const showPrefix = (parts[0] === '100yq' ? '100yq' : 'ft') as 'ft' | '100yq'
		const epNum = parseInt(parts[parts.length - 1])

		await interaction.deferReply({ ephemeral: true })

		const result = this.fancapsService.getRandomThumbnail(showPrefix, epNum)

		if (!result) {
			return interaction.followUp({ content: localize.COMMANDS.FRAME.ERRORS.NOT_FOUND(), ephemeral: true })
		}

		const showName = showPrefix === '100yq' ? '100 Years Quest' : 'Fairy Tail'

		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.FRAME.EMBED.TITLE({
				show: showName,
				episode: result.number,
			}))
			.setDescription(
				(result.title_en ? `**${result.title_en}**` : '')
				+ (result.title_ja ? `\n*${result.title_ja}*` : '')
			)
			.setImage(result.thumbnail)
			.setColor(getColor('primary'))

		await interaction.followUp({ embeds: [embed], ephemeral: true })
	}

}

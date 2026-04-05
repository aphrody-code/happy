import { Category } from '@discordx/utilities'
import {
	ApplicationCommandOptionType,
	CommandInteraction,
	EmbedBuilder,
} from 'discord.js'
import { Client, Slash, SlashChoice, SlashOption } from 'discordx'

import { Discord, Injectable } from '@/decorators'
import { FancapsService } from '@/services'
import { getColor } from '@/utils/functions'

@Discord()
@Injectable()
@Category('General')
export default class FrameCommand {

	constructor(
		private fancapsService: FancapsService
	) {}

	@Slash({
		name: 'frame',
		description: 'Obtenir une image aléatoire d\'un épisode de Fairy Tail',
	})
	async frame(
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
			description: 'Numéro de l\'épisode (optionnel, sinon aléatoire)',
			type: ApplicationCommandOptionType.Integer,
			required: false,
			minValue: 1,
		})
		episodeNumber: number | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		// deferReply() is handled globally by automaticDeferring

		const result = this.fancapsService.getRandomThumbnail(showPrefix, episodeNumber)

		if (!result) {
			return interaction.followUp({
				content: localize.COMMANDS.FRAME.ERRORS.NOT_FOUND(),
			})
		}

		const showName = showPrefix === '100yq' ? 'Fairy Tail: 100 Years Quest' : 'Fairy Tail'

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

		await interaction.followUp({ embeds: [embed] })
	}

}

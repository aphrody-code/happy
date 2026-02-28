import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Client } from 'discordx'

import { happyIdentity, happyQuotes, happyTrivia } from '@/configs'
import { Discord, Slash, SlashChoice, SlashOption } from '@/decorators'
import { getColor } from '@/utils/functions'

@Discord()
@Category('General')
export default class HappyCommand {

	@Slash({
		name: 'happy',
	})
	async happy(
		@SlashChoice({ name: 'Citation', value: 'quote' })
		@SlashChoice({ name: 'Anecdote', value: 'trivia' })
		@SlashChoice({ name: 'Qui est Happy ?', value: 'who' })
		@SlashOption({
			name: 'action',
			localizationSource: 'COMMANDS.HAPPY.OPTIONS.ACTION',
			type: ApplicationCommandOptionType.String,
			required: false,
		})
		action: string | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const embed = new EmbedBuilder()
			.setColor(getColor('happy'))
			.setAuthor({
				name: 'Happy',
				iconURL: client.user!.displayAvatarURL(),
			})

		switch (action) {
			case 'quote': {
				const quote = happyQuotes[Math.floor(Math.random() * happyQuotes.length)]
				embed
					.setTitle(localize.COMMANDS.HAPPY.QUOTE_TITLE())
					.setDescription(`> *"${quote.text}"*`)
					.setFooter({ text: quote.context })
				break
			}

			case 'trivia': {
				const trivia = happyTrivia[Math.floor(Math.random() * happyTrivia.length)]
				embed
					.setTitle(localize.COMMANDS.HAPPY.TRIVIA_TITLE())
					.setDescription(`🐱 ${trivia}`)
				break
			}

			case 'who': {
				embed
					.setTitle(localize.COMMANDS.HAPPY.WHO_TITLE())
					.addFields(
						{ name: 'Nom', value: happyIdentity.nom, inline: true },
						{ name: 'Espèce', value: happyIdentity.espece, inline: true },
						{ name: 'Magie', value: happyIdentity.magie, inline: true },
						{ name: 'Guilde', value: happyIdentity.guilde, inline: true },
						{ name: 'Partenaire', value: happyIdentity.partenaire, inline: true },
						{ name: 'Intérêt amoureux', value: happyIdentity.interetAmoureux, inline: true },
						{ name: 'Équipe', value: happyIdentity.equipe, inline: false },
						{ name: 'Apparence', value: happyIdentity.apparence, inline: false }
					)
					.setFooter({ text: `Première apparition : ${happyIdentity.premiereApparition}` })
				break
			}

			default: {
				const quote = happyQuotes[Math.floor(Math.random() * happyQuotes.length)]
				embed
					.setTitle(localize.COMMANDS.HAPPY.RANDOM_TITLE())
					.setDescription(`> *"${quote.text}"*`)
					.setFooter({ text: 'Utilise /happy quote, /happy trivia ou /happy who pour en savoir plus !' })
				break
			}
		}

		interaction.followUp({ embeds: [embed] })
	}

}

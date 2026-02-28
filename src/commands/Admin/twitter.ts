import { Category } from '@discordx/utilities'
import {
	ApplicationCommandOptionType,
	ChannelType,
	CommandInteraction,
	EmbedBuilder,
	TextChannel,
} from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { Guard, UserPermissions } from '@/guards'
import { simpleErrorEmbed, simpleSuccessEmbed } from '@/utils/functions'

@Discord()
@Injectable()
@Category('Admin')
export default class TwitterCommand {

	@Slash({
		name: 'set-twitter',
		description: 'Envoie la présentation de la communauté X Fairy Tail FR dans un salon.',
	})
	@Guard(
		UserPermissions(['Administrator'])
	)
	async setTwitter(
		@SlashOption({
			name: 'salon',
			description: 'Le salon où envoyer la présentation.',
			type: ApplicationCommandOptionType.Channel,
			channelTypes: [ChannelType.GuildText],
			required: true,
		}) channel: TextChannel,
			interaction: CommandInteraction,
			client: Client,
			{ localize }: InteractionData
	) {
		const guild = interaction.guild
		if (!guild) return

		const embed = new EmbedBuilder()
			.setColor(0x1DA1F2)
			.setTitle('🐦 Communauté X : Fairy Tail France')
			.setDescription(
				'Notre guilde s\'étend au-delà de Discord ! Rejoignez la **communauté Fairy Tail France** '
				+ 'sur X (Twitter), le point de ralliement de la fanbase francophone.\n\n'
				+ '🔗 **[Rejoindre la communauté](https://x.com/i/communities/1787507243883057561)**'
			)
			.addFields(
				{ name: '👥 Membres', value: '~3 157 mages', inline: true },
				{ name: '🛡️ Modérateurs', value: '3', inline: true },
				{ name: '📅 Créée le', value: '6 mai 2024', inline: true }
			)
			.addFields(
				{
					name: '👑 Administrateurs',
					value:
						'**Yoyo** — [@yoyo__goat](https://x.com/yoyo__goat)\n'
						+ '**ZERO** — [@childofmiraxus](https://x.com/childofmiraxus)',
				}
			)
			.setThumbnail('https://i.pinimg.com/originals/a1/bd/f1/a1bdf1d65acd999c00c627b11998cd3b.gif')
			.setImage('https://static.wikia.nocookie.net/vsbattles/images/e/e7/Fairy_Tail_New_Banner.jpg/revision/latest/scale-to-width-down/1000?cb=20201002162834')

		try {
			await channel.send({ embeds: [embed] })

			simpleSuccessEmbed(interaction, `La présentation Twitter a été envoyée dans ${channel.toString()} ! Aye !`)
		} catch {
			simpleErrorEmbed(interaction, 'Impossible d\'envoyer les messages dans ce salon. Vérifiez mes permissions.')
		}
	}

}

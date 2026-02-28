import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, User } from 'discord.js'

import { Discord, Slash, SlashOption } from '@/decorators'
import { getColor, simpleErrorEmbed } from '@/utils/functions'

@Discord()
@Category('General')
export default class BannerCommand {

	@Slash({
		name: 'banner',
		localizationSource: 'COMMANDS.BANNER.DESCRIPTION',
	})
	async banner(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.BANNER.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: false,
		}) user: User | undefined,
			interaction: CommandInteraction,
			{ localize }: InteractionData
	) {
		const targetUser = user ?? interaction.user
		const fullUser = await targetUser.fetch()

		if (!fullUser.banner) {
			return simpleErrorEmbed(interaction, localize.COMMANDS.BANNER.EMBED.NO_BANNER())
		}

		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.BANNER.EMBED.TITLE({ user: fullUser.username }))
			.setColor(getColor('guildeDefault'))
			.setImage(fullUser.bannerURL({ size: 1024 })!)

		await interaction.followUp({ embeds: [embed] })
	}

}

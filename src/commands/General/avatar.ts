import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, User } from 'discord.js'

import { Discord, Slash, SlashOption } from '@/decorators'
import { getColor } from '@/utils/functions'

@Discord()
@Category('General')
export default class AvatarCommand {

	@Slash({
		name: 'avatar',
		localizationSource: 'COMMANDS.AVATAR.DESCRIPTION',
	})
	async avatar(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.AVATAR.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: false,
		}) user: User | undefined,
			interaction: CommandInteraction,
			{ localize }: InteractionData
	) {
		const targetUser = user ?? interaction.user

		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.AVATAR.EMBED.TITLE({ user: targetUser.username }))
			.setColor(getColor('guildeDefault'))
			.setImage(targetUser.displayAvatarURL({ size: 1024 }))

		await interaction.followUp({ embeds: [embed] })
	}

}

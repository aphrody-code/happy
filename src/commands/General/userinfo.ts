import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js'

import { Discord, Slash, SlashOption } from '@/decorators'
import { getColor } from '@/utils/functions'

@Discord()
@Category('General')
export default class UserInfoCommand {

	@Slash({
		name: 'userinfo',
		localizationSource: 'COMMANDS.USERINFO.DESCRIPTION',
	})
	async userinfo(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.USERINFO.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: false,
		}) member: GuildMember | undefined,
			interaction: CommandInteraction,
			{ localize }: InteractionData
	) {
		const targetMember = member ?? (interaction.member as GuildMember)
		const user = targetMember.user

		const roles = targetMember.roles.cache
			.filter(role => role.name !== '@everyone')
			.map(role => role.toString())

		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.USERINFO.EMBED.TITLE({ user: user.username }))
			.setThumbnail(user.displayAvatarURL({ size: 256 }))
			.setColor(targetMember.displayColor || getColor('guildeDefault'))
			.addFields([
				{
					name: localize.COMMANDS.USERINFO.EMBED.FIELDS.ID(),
					value: `\`${user.id}\``,
					inline: true,
				},
				{
					name: localize.COMMANDS.USERINFO.EMBED.FIELDS.BOT(),
					value: user.bot ? 'Oui' : 'Non',
					inline: true,
				},
				{
					name: localize.COMMANDS.USERINFO.EMBED.FIELDS.CREATED(),
					value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
					inline: true,
				},
				{
					name: localize.COMMANDS.USERINFO.EMBED.FIELDS.JOINED(),
					value: targetMember.joinedTimestamp ? `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>` : 'Inconnu',
					inline: true,
				},
				{
					name: localize.COMMANDS.USERINFO.EMBED.FIELDS.ROLES({ count: roles.length }),
					value: roles.length > 0 ? roles.join(', ') : 'Aucun',
					inline: false,
				},
			])

		await interaction.followUp({ embeds: [embed] })
	}

}

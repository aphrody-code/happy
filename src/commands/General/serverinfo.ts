import { Category } from '@discordx/utilities'
import { ChannelType, CommandInteraction, EmbedBuilder } from 'discord.js'

import { Discord, Slash } from '@/decorators'
import { getColor } from '@/utils/functions'

@Discord()
@Category('General')
export default class ServerInfoCommand {

	@Slash({
		name: 'serverinfo',
		localizationSource: 'COMMANDS.SERVERINFO.DESCRIPTION',
	})
	async serverinfo(
		interaction: CommandInteraction,
		{ localize }: InteractionData
	) {
		const guild = interaction.guild
		if (!guild) return

		const owner = await guild.fetchOwner()

		const channels = guild.channels.cache
		const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size
		const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size
		const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size

		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.SERVERINFO.EMBED.TITLE({ guild: guild.name }))
			.setThumbnail(guild.iconURL({ size: 256 }))
			.setColor(getColor('guildeDefault'))
			.addFields([
				{
					name: localize.COMMANDS.SERVERINFO.EMBED.FIELDS.OWNER(),
					value: owner.user.toString(),
					inline: true,
				},
				{
					name: localize.COMMANDS.SERVERINFO.EMBED.FIELDS.CREATED(),
					value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
					inline: true,
				},
				{
					name: localize.COMMANDS.SERVERINFO.EMBED.FIELDS.MEMBERS(),
					value: `Total: **${guild.memberCount}**`,
					inline: true,
				},
				{
					name: localize.COMMANDS.SERVERINFO.EMBED.FIELDS.CHANNELS(),
					value: `📝 ${textChannels} | 🔊 ${voiceChannels} | 📂 ${categories}`,
					inline: true,
				},
				{
					name: localize.COMMANDS.SERVERINFO.EMBED.FIELDS.ROLES(),
					value: `**${guild.roles.cache.size}**`,
					inline: true,
				},
				{
					name: localize.COMMANDS.SERVERINFO.EMBED.FIELDS.BOOSTS(),
					value: `Niveau **${guild.premiumTier}** (**${guild.premiumSubscriptionCount}** boosts)`,
					inline: true,
				},
			])

		if (guild.bannerURL()) embed.setImage(guild.bannerURL({ size: 1024 }))

		await interaction.followUp({ embeds: [embed] })
	}

}

import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, ColorResolvable, CommandInteraction, EmbedBuilder, TextChannel } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { Guard, UserPermissions } from '@/guards'
import { simpleSuccessEmbed } from '@/utils/functions'

@Discord()
@Injectable()
@Category('Admin')
export default class AnnounceCommand {

	@Slash({ name: 'announce' })
	@Guard(
		UserPermissions(['Administrator'])
	)
	async announce(
		@SlashOption({
			name: 'channel',
			localizationSource: 'COMMANDS.ANNOUNCE.OPTIONS.CHANNEL',
			type: ApplicationCommandOptionType.Channel,
			required: true,
		}) channel: TextChannel,
		@SlashOption({
			name: 'title',
			localizationSource: 'COMMANDS.ANNOUNCE.OPTIONS.TITLE',
			type: ApplicationCommandOptionType.String,
			required: true,
		}) title: string,
		@SlashOption({
			name: 'message',
			localizationSource: 'COMMANDS.ANNOUNCE.OPTIONS.MESSAGE',
			type: ApplicationCommandOptionType.String,
			required: true,
		}) message: string,
		@SlashOption({
			name: 'color',
			localizationSource: 'COMMANDS.ANNOUNCE.OPTIONS.COLOR',
			type: ApplicationCommandOptionType.String,
		}) color: string | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(message)
			.setTimestamp()

		if (color) {
			try {
				embed.setColor(color as ColorResolvable)
			} catch {
				embed.setColor(0x5865F2)
			}
		} else {
			embed.setColor(0x5865F2)
		}

		await channel.send({ embeds: [embed] })

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.ANNOUNCE.SUCCESS({ channel: `<#${channel.id}>` })
		)
	}

}

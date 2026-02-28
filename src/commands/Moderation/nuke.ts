import { Category } from '@discordx/utilities'
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	TextChannel,
} from 'discord.js'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { ModerationLog } from '@/entities'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'
import { resolveGuild } from '@/utils/functions'

import { ModerationAction } from '../../entities/ModerationLog'

@Discord()
@Injectable()
@Category('Moderation')
export default class NukeCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'nuke',
		localizationSource: 'COMMANDS.NUKE.DESCRIPTION',
	})
	@Guard(
		UserPermissions(['ManageChannels'])
	)
	async nuke(
		@SlashOption({
			name: 'channel',
			localizationSource: 'COMMANDS.NUKE.OPTIONS.CHANNEL',
			type: ApplicationCommandOptionType.Channel,
		}) channel: TextChannel | undefined,
			interaction: CommandInteraction,
			{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const targetChannel = channel ?? (interaction.channel as TextChannel)

		if (!targetChannel.isTextBased() || targetChannel.isThread())
			return interaction.reply({ content: localize.COMMANDS.NUKE.TEXT_ONLY(), ephemeral: true })

		const confirmButton = new ButtonBuilder()
			.setCustomId('confirm-nuke')
			.setLabel(localize.COMMANDS.NUKE.CONFIRM_BUTTON())
			.setStyle(ButtonStyle.Danger)

		const cancelButton = new ButtonBuilder()
			.setCustomId('cancel-nuke')
			.setLabel(localize.COMMANDS.NUKE.CANCEL_BUTTON())
			.setStyle(ButtonStyle.Secondary)

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton)

		const response = await interaction.reply({
			content: localize.COMMANDS.NUKE.CONFIRM({ channel: targetChannel.toString() }),
			components: [row],
			ephemeral: true,
		})

		const collector = response.createMessageComponentCollector({
			filter: i => i.user.id === interaction.user.id,
			time: 15000,
		})

		collector.on('collect', async (i) => {
			if (i.customId === 'confirm-nuke') {
				const position = targetChannel.position
				const parent = targetChannel.parentId

				const newChannel = await targetChannel.clone({
					name: targetChannel.name,
					parent: parent ?? undefined,
					position,
					reason: `Nuke by ${interaction.user.tag}`,
				})

				await targetChannel.delete(`Nuke by ${interaction.user.tag}`)

				await newChannel.send({
					content: localize.COMMANDS.NUKE.SUCCESS({ user: interaction.user.toString() }),
				})

				const log = new ModerationLog()
				log.discordGuildId = guild.id
				log.action = ModerationAction.NUKE
				log.moderatorId = interaction.user.id
				log.targetId = newChannel.id
				log.additionalData = { channelName: targetChannel.name }
				await this.db.em.persistAndFlush(log)
			} else {
				await i.update({ content: localize.COMMANDS.NUKE.CANCELLED(), components: [] })
			}
		})
	}

}

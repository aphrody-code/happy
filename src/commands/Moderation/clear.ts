import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, Collection, CommandInteraction, GuildMember, Message, TextChannel, User } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { ModerationLog } from '@/entities'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'
import { resolveGuild, simpleErrorEmbed, simpleSuccessEmbed } from '@/utils/functions'

import { ModerationAction } from '../../entities/ModerationLog'

@Discord()
@Injectable()
@Category('Moderation')
export default class ClearCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ name: 'clear' })
	@Guard(
		UserPermissions(['ManageMessages'])
	)
	async clear(
		@SlashOption({
			name: 'count',
			localizationSource: 'COMMANDS.CLEAR.OPTIONS.COUNT',
			type: ApplicationCommandOptionType.Integer,
			required: true,
			minValue: 1,
			maxValue: 100,
		}) count: number,
		@SlashOption({
			name: 'user',
			localizationSource: 'COMMANDS.CLEAR.OPTIONS.USER',
			type: ApplicationCommandOptionType.User,
		}) user: GuildMember | User | undefined,
		@SlashOption({
			name: 'bots_only',
			localizationSource: 'COMMANDS.CLEAR.OPTIONS.BOTS_ONLY',
			type: ApplicationCommandOptionType.Boolean,
		}) botsOnly: boolean | undefined,
		@SlashOption({
			name: 'contains',
			localizationSource: 'COMMANDS.CLEAR.OPTIONS.CONTAINS',
			type: ApplicationCommandOptionType.String,
		}) contains: string | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		const channel = interaction.channel as TextChannel
		if (!channel) return

		let messages: Collection<string, Message> = await channel.messages.fetch({ limit: 100 })

		// Filter out messages older than 14 days (Discord API limit)
		const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000
		messages = messages.filter(m => m.createdTimestamp > fourteenDaysAgo)

		if (user) {
			const userId = user instanceof GuildMember ? user.id : user.id
			messages = messages.filter(m => m.author.id === userId)
		}

		if (botsOnly) {
			messages = messages.filter(m => m.author.bot)
		}

		if (contains) {
			const search = contains.toLowerCase()
			messages = messages.filter(m => m.content.toLowerCase().includes(search))
		}

		const toDelete = [...messages.values()].slice(0, count)

		if (toDelete.length === 0)
			return simpleErrorEmbed(interaction, localize.COMMANDS.CLEAR.ERRORS.NO_MESSAGES())

		const deleted = await channel.bulkDelete(toDelete, true)

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.CLEAR
		log.moderatorId = interaction.user.id
		log.targetId = interaction.user.id
		log.additionalData = {
			channelId: channel.id,
			messageCount: deleted.size,
			filteredUser: user instanceof GuildMember ? user.id : user?.id,
			botsOnly: botsOnly ?? false,
			contains: contains ?? null,
		}
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.CLEAR.SUCCESS({ count: deleted.size })
		)
	}

}

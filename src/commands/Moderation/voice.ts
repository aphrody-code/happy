import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from 'discord.js'

import { Discord, Injectable, Slash, SlashOption } from '@/decorators'
import { ModerationLog } from '@/entities'
import { Guard, UserPermissions } from '@/guards'
import { Database } from '@/services'
import { resolveGuild, simpleErrorEmbed, simpleSuccessEmbed } from '@/utils/functions'

import { ModerationAction } from '../../entities/ModerationLog'

@Discord()
@Injectable()
@Category('Moderation')
export default class VoiceModerationCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'vmute',
		localizationSource: 'COMMANDS.VMUTE.DESCRIPTION',
	})
	@Guard(
		UserPermissions(['MuteMembers'])
	)
	async vmute(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.VMUTE.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.VMUTE.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
		}) reason: string | undefined,
		interaction: CommandInteraction,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		if (!member.voice.channel)
			return simpleErrorEmbed(interaction, localize.COMMANDS.VMUTE.NOT_IN_VOICE())

		await member.voice.setMute(true, reason ?? undefined)

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.VMUTE
		log.moderatorId = interaction.user.id
		log.targetId = member.id
		log.reason = reason ?? null
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.VMUTE.SUCCESS({ member: member.user.tag })
		)
	}

	@Slash({
		name: 'vunmute',
		localizationSource: 'COMMANDS.VUNMUTE.DESCRIPTION',
	})
	@Guard(
		UserPermissions(['MuteMembers'])
	)
	async vunmute(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.VUNMUTE.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.VUNMUTE.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
		}) reason: string | undefined,
		interaction: CommandInteraction,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		await member.voice.setMute(false, reason ?? undefined)

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.VUNMUTE
		log.moderatorId = interaction.user.id
		log.targetId = member.id
		log.reason = reason ?? null
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.VUNMUTE.SUCCESS({ member: member.user.tag })
		)
	}

	@Slash({
		name: 'vdeafen',
		localizationSource: 'COMMANDS.DEAFEN.DESCRIPTION',
	})
	@Guard(
		UserPermissions(['DeafenMembers'])
	)
	async vdeafen(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.DEAFEN.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.DEAFEN.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
		}) reason: string | undefined,
		interaction: CommandInteraction,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		if (!member.voice.channel)
			return simpleErrorEmbed(interaction, localize.COMMANDS.DEAFEN.NOT_IN_VOICE())

		await member.voice.setDeaf(true, reason ?? undefined)

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.DEAFEN
		log.moderatorId = interaction.user.id
		log.targetId = member.id
		log.reason = reason ?? null
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.DEAFEN.SUCCESS({ member: member.user.tag })
		)
	}

	@Slash({
		name: 'vundeafen',
		localizationSource: 'COMMANDS.UNDEAFEN.DESCRIPTION',
	})
	@Guard(
		UserPermissions(['DeafenMembers'])
	)
	async vundeafen(
		@SlashOption({
			name: 'member',
			localizationSource: 'COMMANDS.UNDEAFEN.OPTIONS.MEMBER',
			type: ApplicationCommandOptionType.User,
			required: true,
		}) member: GuildMember,
		@SlashOption({
			name: 'reason',
			localizationSource: 'COMMANDS.UNDEAFEN.OPTIONS.REASON',
			type: ApplicationCommandOptionType.String,
		}) reason: string | undefined,
		interaction: CommandInteraction,
		{ localize }: InteractionData
	) {
		const guild = resolveGuild(interaction)
		if (!guild) return

		await member.voice.setDeaf(false, reason ?? undefined)

		const log = new ModerationLog()
		log.discordGuildId = guild.id
		log.action = ModerationAction.UNDEAFEN
		log.moderatorId = interaction.user.id
		log.targetId = member.id
		log.reason = reason ?? null
		await this.db.em.persistAndFlush(log)

		simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.UNDEAFEN.SUCCESS({ member: member.user.tag })
		)
	}

}

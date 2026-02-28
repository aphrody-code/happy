import { ChannelType, EmbedBuilder, TextChannel } from 'discord.js'
import { ArgsOf, Client } from 'discordx'

import { Discord, Injectable, On } from '@/decorators'

function findLogChannel(guild: import('discord.js').Guild): TextChannel | undefined {
	return guild.channels.cache.find(
		c => c.type === ChannelType.GuildText && (c.name === 'logs' || c.name === 'mod-logs' || c.name === 'audit-log')
	) as TextChannel | undefined
}

@Discord()
@Injectable()
export default class AuditLogEvent {

	@On('messageDelete')
	async onMessageDelete(
		[message]: ArgsOf<'messageDelete'>,
		client: Client
	) {
		if (!message.guild || message.author?.bot) return
		const logChannel = findLogChannel(message.guild)
		if (!logChannel) return

		const embed = new EmbedBuilder()
			.setColor(0xE74C3C)
			.setTitle('Message supprimé')
			.setDescription(
				`**Auteur :** ${message.author?.toString() ?? 'Inconnu'}\n` +
				`**Salon :** ${message.channel.toString()}\n` +
				`**Contenu :**\n${message.content?.substring(0, 1024) || '*Aucun contenu textuel*'}`
			)
			.setTimestamp()

		if (message.attachments.size > 0) {
			embed.addFields({
				name: 'Pièces jointes',
				value: message.attachments.map(a => a.url).join('\n').substring(0, 1024),
			})
		}

		logChannel.send({ embeds: [embed] }).catch(() => {})
	}

	@On('messageUpdate')
	async onMessageUpdate(
		[oldMessage, newMessage]: ArgsOf<'messageUpdate'>,
		client: Client
	) {
		if (!newMessage.guild || newMessage.author?.bot) return
		if (oldMessage.content === newMessage.content) return

		const logChannel = findLogChannel(newMessage.guild)
		if (!logChannel) return

		const embed = new EmbedBuilder()
			.setColor(0xF39C12)
			.setTitle('Message modifié')
			.setDescription(
				`**Auteur :** ${newMessage.author?.toString() ?? 'Inconnu'}\n` +
				`**Salon :** ${newMessage.channel.toString()}\n` +
				`[Aller au message](${newMessage.url})`
			)
			.addFields(
				{ name: 'Avant', value: oldMessage.content?.substring(0, 1024) || '*Vide*' },
				{ name: 'Après', value: newMessage.content?.substring(0, 1024) || '*Vide*' }
			)
			.setTimestamp()

		logChannel.send({ embeds: [embed] }).catch(() => {})
	}

	@On('guildBanAdd')
	async onBanAdd(
		[ban]: ArgsOf<'guildBanAdd'>,
		client: Client
	) {
		const logChannel = findLogChannel(ban.guild)
		if (!logChannel) return

		const embed = new EmbedBuilder()
			.setColor(0xE74C3C)
			.setTitle('Membre banni')
			.setDescription(
				`**Utilisateur :** ${ban.user.tag} (${ban.user.id})\n` +
				`**Raison :** ${ban.reason ?? 'Aucune raison spécifiée'}`
			)
			.setThumbnail(ban.user.displayAvatarURL({ size: 128 }))
			.setTimestamp()

		logChannel.send({ embeds: [embed] }).catch(() => {})
	}

	@On('guildBanRemove')
	async onBanRemove(
		[ban]: ArgsOf<'guildBanRemove'>,
		client: Client
	) {
		const logChannel = findLogChannel(ban.guild)
		if (!logChannel) return

		const embed = new EmbedBuilder()
			.setColor(0x2ECC71)
			.setTitle('Membre débanni')
			.setDescription(`**Utilisateur :** ${ban.user.tag} (${ban.user.id})`)
			.setThumbnail(ban.user.displayAvatarURL({ size: 128 }))
			.setTimestamp()

		logChannel.send({ embeds: [embed] }).catch(() => {})
	}

	@On('channelCreate')
	async onChannelCreate(
		[channel]: ArgsOf<'channelCreate'>,
		client: Client
	) {
		if (!channel.guild) return
		const logChannel = findLogChannel(channel.guild)
		if (!logChannel) return

		const embed = new EmbedBuilder()
			.setColor(0x2ECC71)
			.setTitle('Salon créé')
			.setDescription(`**Salon :** ${channel.toString()} (${channel.name})`)
			.setTimestamp()

		logChannel.send({ embeds: [embed] }).catch(() => {})
	}

	@On('channelDelete')
	async onChannelDelete(
		[channel]: ArgsOf<'channelDelete'>,
		client: Client
	) {
		if (!('guild' in channel) || !channel.guild) return
		const logChannel = findLogChannel(channel.guild)
		if (!logChannel || logChannel.id === channel.id) return

		const embed = new EmbedBuilder()
			.setColor(0xE74C3C)
			.setTitle('Salon supprimé')
			.setDescription(`**Salon :** #${channel.name}`)
			.setTimestamp()

		logChannel.send({ embeds: [embed] }).catch(() => {})
	}

	@On('guildMemberUpdate')
	async onMemberUpdate(
		[oldMember, newMember]: ArgsOf<'guildMemberUpdate'>,
		client: Client
	) {
		const logChannel = findLogChannel(newMember.guild)
		if (!logChannel) return

		// Changement de rôles
		const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id))
		const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id))

		if (addedRoles.size === 0 && removedRoles.size === 0) return

		const parts: string[] = []
		if (addedRoles.size > 0) parts.push(`**+** ${addedRoles.map(r => r.toString()).join(', ')}`)
		if (removedRoles.size > 0) parts.push(`**-** ${removedRoles.map(r => r.toString()).join(', ')}`)

		const embed = new EmbedBuilder()
			.setColor(0x3498DB)
			.setTitle('Rôles modifiés')
			.setDescription(
				`**Membre :** ${newMember.toString()}\n` +
				parts.join('\n')
			)
			.setTimestamp()

		logChannel.send({ embeds: [embed] }).catch(() => {})
	}

}

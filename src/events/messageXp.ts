import { ChannelType, EmbedBuilder, TextChannel } from 'discord.js'
import { ArgsOf, Client } from 'discordx'

import { Discord, Injectable, On } from '@/decorators'
import { RPGPlayer } from '@/entities'
import { Database } from '@/services'

const XP_MIN = 15
const XP_MAX = 25
const COOLDOWN_MS = 60_000 // 1 minute entre chaque gain d'XP
const XP_PER_LEVEL = (level: number) => level * 100

@Discord()
@Injectable()
export default class MessageXpEvent {

	private cooldowns = new Map<string, number>()

	constructor(
		private db: Database
	) {}

	@On('messageCreate')
	async messageXpHandler(
		[message]: ArgsOf<'messageCreate'>,
		client: Client
	) {
		if (message.author.bot) return
		if (!message.guild) return
		if (message.content.startsWith('/')) return

		const key = `${message.guild.id}:${message.author.id}`
		const now = Date.now()
		const lastXp = this.cooldowns.get(key) ?? 0

		if (now - lastXp < COOLDOWN_MS) return

		this.cooldowns.set(key, now)

		const repo = this.db.get(RPGPlayer) as import('@/entities').RPGPlayerRepository
		const player = await repo.findOrCreate(message.author.id, message.guild.id)

		const xpGain = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN
		player.xp += xpGain

		const xpNeeded = XP_PER_LEVEL(player.level)

		if (player.xp >= xpNeeded) {
			player.xp -= xpNeeded
			player.level += 1
			player.maxHp += 10
			player.hp = player.maxHp
			player.maxMp += 5
			player.mp = player.maxMp
			player.jewels += player.level * 50

			await this.db.em.persistAndFlush(player)

			const embed = new EmbedBuilder()
				.setColor(0xE8672A)
				.setTitle('Niveau supérieur !')
				.setDescription(
					`${message.author.toString()} est passé au **niveau ${player.level}** !\n\n` +
					`PV max : ${player.maxHp} | PM max : ${player.maxMp}\n` +
					`+${player.level * 50} Joyaux`
				)
				.setThumbnail(message.author.displayAvatarURL({ size: 128 }))

			const channel = message.channel
			if (channel.type === ChannelType.GuildText) {
				(channel as TextChannel).send({ embeds: [embed] }).catch(() => {})
			}
		} else {
			await this.db.em.persistAndFlush(player)
		}
	}

}

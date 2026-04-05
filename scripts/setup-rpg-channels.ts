/**
 * Peuple les salons de la catégorie ⚔️ RPG avec du contenu.
 * Salons : #aventure, #boutique, #quêtes, #classement, #commandes-rpg
 *
 * Usage: npx tsx scripts/setup-rpg-channels.ts [--force]
 */
import 'dotenv/config'

import {
	ChannelType,
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	type GuildChannel,
	type Message,
	type TextChannel,
} from 'discord.js'

import { CHANNEL_NAMES } from '../src/configs/serverStructure'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] })
const GUILD_ID = process.env.TEST_GUILD_ID!
const force = process.argv.includes('--force')

function findChannel(channels: Map<string, GuildChannel>, name: string): TextChannel | null {
	const ch = [...channels.values()].find(c => c.name === name && c.type === ChannelType.GuildText)
	return (ch as TextChannel) ?? null
}

async function sleep(ms: number) {
	return new Promise(r => setTimeout(r, ms))
}

async function clearBotMessages(channel: TextChannel) {
	const existing: Message[] = []
	let lastId: string | undefined
	while (true) {
		const batch = await channel.messages.fetch({ limit: 100, ...(lastId ? { before: lastId } : {}) })
		if (batch.size === 0) break
		for (const [, msg] of batch) {
			if (msg.author.id === client.user!.id) existing.push(msg)
		}
		lastId = batch.last()!.id
		if (batch.size < 100) break
	}
	if (existing.length > 0) {
		console.log(`  🗑️  Suppression de ${existing.length} ancien(s) message(s)...`)
		for (const msg of existing) {
			await msg.delete().catch(() => {})
			await sleep(300)
		}
	}
}

async function hasMessages(channel: TextChannel): Promise<boolean> {
	const msgs = await channel.messages.fetch({ limit: 1 }).catch(() => null)
	return msgs != null && msgs.size > 0
}

// ── 🗺️ Aventure ──

async function setupAventure(channel: TextChannel) {
	const intro = new EmbedBuilder()
		.setColor(0xE8672A)
		.setTitle('🗺️ Bienvenue dans le RPG Fairy Tail')
		.setDescription(
			'Tu n\'es pas juste un membre ici — tu es un **mage de Fiore**.\n\n'
			+ 'Explore les villes et lieux mythiques de l\'univers Fairy Tail, '
			+ 'rencontre des personnages, accomplis des quêtes et gagne des **Joyaux** et de l\'**XP**.\n\n'
			+ '> *« Le courage, ce n\'est pas de ne pas avoir peur. C\'est d\'avancer malgré la peur. »*\n'
			+ '> — Natsu Dragneel'
		)

	const monde = new EmbedBuilder()
		.setColor(0x3498DB)
		.setTitle('🌍 Le Monde de Fiore')
		.setDescription(
			'**Lieux disponibles :**\n\n'
			+ '🏘️ **Magnolia** — Ville paisible abritant la guilde Fairy Tail\n'
			+ '🏛️ **Guilde Fairy Tail** — Le bâtiment emblématique. PNJ : Natsu, Lucy, Mirajane, Makarof\n'
			+ '🚂 **Gare de Magnolia** — Point de départ pour vos missions\n'
			+ '🌸 **Crocus** — Capitale fleurie de Fiore (Grands Jeux Inter-Magiques)\n'
			+ '🌳 **Parc de Magnolia** — Grand parc verdoyant (poisson frais !)\n\n'
			+ '*De nouveaux lieux seront ajoutés au fur et à mesure de l\'aventure.*'
		)

	const commencer = new EmbedBuilder()
		.setColor(0x2ECC71)
		.setTitle('🎯 Comment commencer ?')
		.setDescription(
			'**1.** Tape `/rpg explorer` pour voir ton lieu actuel\n'
			+ '**2.** Tape `/rpg deplacer` pour te déplacer vers un autre lieu\n'
			+ '**3.** Tape `/rpg parler` pour parler à un PNJ\n'
			+ '**4.** Tape `/rpg profil` pour voir ta carte de mage\n'
			+ '**5.** N\'oublie pas ton `/daily` pour tes Joyaux quotidiens !\n\n'
			+ 'Tu gagnes aussi de l\'XP passivement en discutant sur le serveur.'
		)

	await channel.send({ embeds: [intro, monde] })
	await sleep(500)
	await channel.send({ embeds: [commencer] })
}

// ── 🏪 Boutique ──

async function setupBoutique(channel: TextChannel) {
	const intro = new EmbedBuilder()
		.setColor(0xF39C12)
		.setTitle('🏪 Boutique de Magnolia')
		.setDescription(
			'Bienvenue à la boutique ! Dépensez vos **Joyaux** pour acheter des objets.\n\n'
			+ 'Utilisez la commande **`/shop`** pour voir le catalogue et acheter.'
		)

	const catalogue = new EmbedBuilder()
		.setColor(0xE8672A)
		.setTitle('📦 Catalogue')
		.setDescription(
			'**Consommables**\n'
			+ '🧪 Potion de soin — 100 J *(+50 PV)*\n'
			+ '💧 Potion de magie — 120 J *(+30 PM)*\n'
			+ '❤️‍🔥 Élixir vital — 500 J *(PV max)*\n'
			+ '💎 Élixir magique — 600 J *(PM max)*\n\n'
			+ '**Permanents**\n'
			+ '🔮 Cristal de force — 1 500 J *(+20 PV max)*\n'
			+ '✨ Cristal de magie — 1 500 J *(+10 PM max)*\n\n'
			+ '**Collectibles**\n'
			+ '🔥 Lacrima de feu — 2 000 J\n'
			+ '🧊 Lacrima de glace — 2 000 J\n'
			+ '🔑 Clé du Zodiaque (argent) — 5 000 J\n'
			+ '🗝️ Clé du Zodiaque (or) — 15 000 J'
		)

	const gains = new EmbedBuilder()
		.setColor(0x2ECC71)
		.setTitle('💰 Comment gagner des Joyaux ?')
		.setDescription(
			'**`/daily`** — Récompense quotidienne (200 J + bonus série)\n'
			+ '**Discuter** — XP passive en chattant (+Joyaux à chaque level up)\n'
			+ '**Quêtes** — Récompenses en Joyaux et XP\n'
			+ '**Level up** — Bonus de niveau × 50 Joyaux'
		)

	await channel.send({ embeds: [intro, catalogue] })
	await sleep(500)
	await channel.send({ embeds: [gains] })
}

// ── 📋 Quêtes ──

async function setupQuetes(channel: TextChannel) {
	const intro = new EmbedBuilder()
		.setColor(0x9B59B6)
		.setTitle('📋 Tableau des Quêtes')
		.setDescription(
			'Comme au vrai tableau de la guilde, voici les missions disponibles.\n\n'
			+ '> *« Une mission, c\'est pas juste du travail. C\'est l\'aventure ! »*\n'
			+ '> — Natsu'
		)

	const quetes = new EmbedBuilder()
		.setColor(0x3498DB)
		.setTitle('📜 Quêtes disponibles')
		.setDescription(
			'**🗺️ Bienvenue à Magnolia** — *Exploration*\n'
			+ 'Explorez la ville pour vous familiariser avec les lieux.\n'
			+ 'Récompense : 50 J + 20 XP | 3 étapes\n\n'
			+ '**🐟 Un poisson pour Happy** — *Exploration*\n'
			+ 'Allez au parc de Magnolia et trouvez un poisson frais pour Happy.\n'
			+ 'Récompense : 20 J + 10 XP + Badge Ami de Happy | 2 étapes\n\n'
			+ '**🔥 Entraînement musclé** — *Combat*\n'
			+ 'Affrontez Natsu dans la guilde pour tester vos capacités.\n'
			+ 'Récompense : 100 J + 50 XP | 1 étape\n\n'
			+ '*De nouvelles quêtes seront ajoutées régulièrement !*'
		)

	await channel.send({ embeds: [intro, quetes] })
}

// ── 🏆 Classement ──

async function setupClassement(channel: TextChannel) {
	const embed = new EmbedBuilder()
		.setColor(0xFFD700)
		.setTitle('🏆 Classement des Mages')
		.setDescription(
			'Qui sont les mages les plus puissants du serveur ?\n\n'
			+ 'Utilisez **`/leaderboard`** pour voir le top 15.\n\n'
			+ '🥇🥈🥉 Les 3 premiers reçoivent une médaille spéciale !\n\n'
			+ '**Comment monter ?**\n'
			+ '• Gagnez de l\'XP en discutant (15-25 XP/message, cooldown 1min)\n'
			+ '• Complétez des quêtes\n'
			+ '• Récupérez votre `/daily` chaque jour\n\n'
			+ '*Le classement se met à jour en temps réel.*'
		)

	await channel.send({ embeds: [embed] })
}

// ── 🤖 Commandes RPG ──

async function setupCommandesRpg(channel: TextChannel) {
	const embed = new EmbedBuilder()
		.setColor(0xE8672A)
		.setTitle('🤖 Commandes RPG')
		.setDescription(
			'**Exploration**\n'
			+ '`/rpg profil` — Voir ta carte de mage\n'
			+ '`/rpg explorer` — Explorer le lieu actuel\n'
			+ '`/rpg deplacer <lieu>` — Se déplacer\n'
			+ '`/rpg parler <personnage>` — Parler à un PNJ\n\n'
			+ '**Économie**\n'
			+ '`/daily` — Récompense quotidienne (200+ Joyaux)\n'
			+ '`/shop` — Boutique de Magnolia\n'
			+ '`/inventaire` — Voir tes objets\n\n'
			+ '**Classement**\n'
			+ '`/rank` — Ta carte de rang (ou celle d\'un autre)\n'
			+ '`/leaderboard` — Top 15 des mages\n\n'
			+ '*Aye Sir ! Bonne aventure, mage !* 🐟'
		)

	await channel.send({ embeds: [embed] })
}

// ── Main ──

client.once('ready', async () => {
	console.log(`\n🤖 Bot connecté : ${client.user!.tag}`)
	console.log(`🏠 Guild : ${GUILD_ID}`)
	console.log(`🔄 Mode : ${force ? 'FORCE' : 'NORMAL'}\n`)

	try {
		const guild = await client.guilds.fetch(GUILD_ID)
		await guild.channels.fetch()
		const channels = guild.channels.cache as Map<string, GuildChannel>

		const tasks: { name: string, channel: TextChannel | null, setup: (ch: TextChannel) => Promise<void> }[] = [
			{ name: CHANNEL_NAMES.RPG_ADVENTURE, channel: findChannel(channels, CHANNEL_NAMES.RPG_ADVENTURE), setup: setupAventure },
			{ name: CHANNEL_NAMES.RPG_SHOP, channel: findChannel(channels, CHANNEL_NAMES.RPG_SHOP), setup: setupBoutique },
			{ name: CHANNEL_NAMES.RPG_QUESTS, channel: findChannel(channels, CHANNEL_NAMES.RPG_QUESTS), setup: setupQuetes },
			{ name: CHANNEL_NAMES.RPG_LEADERBOARD, channel: findChannel(channels, CHANNEL_NAMES.RPG_LEADERBOARD), setup: setupClassement },
			{ name: CHANNEL_NAMES.RPG_COMMANDS, channel: findChannel(channels, CHANNEL_NAMES.RPG_COMMANDS), setup: setupCommandesRpg },
		]

		for (const task of tasks) {
			if (!task.channel) {
				console.log(`❌ Salon ${task.name} introuvable — il sera créé par setup-all.ts`)
				continue
			}

			if (!force && await hasMessages(task.channel)) {
				console.log(`⏭️  ${task.name} déjà configuré, skip`)
				continue
			}

			if (force) await clearBotMessages(task.channel)

			await task.setup(task.channel)
			console.log(`✅ ${task.name} configuré`)
			await sleep(1000)
		}

		console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.log('🎉 Salons RPG configurés ! Aye Sir !')
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
	} catch (err) {
		console.error('❌ Erreur :', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

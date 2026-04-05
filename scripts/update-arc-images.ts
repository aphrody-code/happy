import 'dotenv/config'

import {
	ChannelType,
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	TextChannel,
} from 'discord.js'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] })
const GUILD_ID = process.env.TEST_GUILD_ID!

const ARC_IMAGES: Record<string, string> = {
	'macao-à-galuna': 'https://static.wikia.nocookie.net/fairytail/images/8/89/Galuna_Island_arc.png/revision/latest?cb=20160910130035',
	'phantom-lord': 'https://static.wikia.nocookie.net/fairytail/images/b/bb/Fairy_Tail_Guild_wrecked_by_Phantom_Lord.jpg/revision/latest?cb=20100313114501',
	'tour-du-paradis': 'https://static.wikia.nocookie.net/fairytail/images/c/c6/Tower_of_Heaven_arc_-_Final_Ending.png/revision/latest?cb=20160326143518',
	'battle-of-fairy-tail': 'https://static.wikia.nocookie.net/fairytail/images/1/1d/The_Battle_of_Fairy_Tail_arc_-_Final_Ending.png/revision/latest?cb=20160326143516',
	'oración-seis': 'https://static.wikia.nocookie.net/fairytail/images/b/b7/The_Oración_Seis.png/revision/latest?cb=20111225000638',
	'edolas': 'https://static.wikia.nocookie.net/fairytail/images/4/41/Erza_Knightwalker.png/revision/latest?cb=20111211173831',
	'île-tenrô': 'https://static.wikia.nocookie.net/fairytail/images/e/e0/Tenrou_Island_Banner.png/revision/latest?cb=20130105221735',
	'grands-jeux-magiques': 'https://static.wikia.nocookie.net/fairytail/images/e/ea/Grand_Magic_Games_banner.png/revision/latest?cb=20130111223643',
	'éclipse': 'https://static.wikia.nocookie.net/fairytail/images/2/28/Eclipse_Celestial_Spirits_arc.png/revision/latest?cb=20141025053406',
	'tartaros': 'https://static.wikia.nocookie.net/fairytail/images/4/40/Tartaros_arc_Poster.png/revision/latest?cb=20150516102311',
	'arbaless': 'https://static.wikia.nocookie.net/fairytail/images/2/20/Alvarez_Empire_arc.png/revision/latest?cb=20190412155913',
	'100-years-quest': 'https://static.wikia.nocookie.net/fairytail/images/0/02/Fairy-tail-100-years-quest.png/revision/latest?cb=20180717161502',
}

async function sleep(ms: number) {
	return new Promise(r => setTimeout(r, ms))
}

client.once('ready', async () => {
	console.log(`Bot connecté : ${client.user!.tag}`)

	try {
		const guild = await client.guilds.fetch(GUILD_ID)
		const channels = await guild.channels.fetch()
		let count = 0

		for (const [, ch] of channels) {
			if (!ch || ch.type !== ChannelType.GuildText) continue
			const tc = ch as TextChannel

			// Chercher si ce salon correspond à un arc
			const arcKey = Object.keys(ARC_IMAGES).find(key => tc.name.includes(key))
			if (!arcKey) continue

			const imageUrl = ARC_IMAGES[arcKey]

			// Chercher le message du bot
			const messages = await tc.messages.fetch({ limit: 5 }).catch(() => null)
			if (!messages) continue

			for (const [, msg] of messages) {
				if (msg.author.id !== client.user!.id) continue
				if (msg.embeds.length === 0) continue

				const oldEmbed = msg.embeds[0]

				const newEmbed = new EmbedBuilder()
					.setTitle(oldEmbed.title ?? `#${tc.name}`)
					.setDescription(oldEmbed.description ?? 'Bienvenue dans ce salon de la guilde.')
					.setColor(0xE8672A)
					.setImage(imageUrl)
					.setFooter({ text: 'Happy 🐟' })

				try {
					await msg.edit({ embeds: [newEmbed] })
					count++
					console.log(`  ✅ #${tc.name} → image ajoutée`)
				} catch (err: any) {
					console.error(`  ❌ #${tc.name}: ${err.message}`)
				}
				await sleep(300)
				break
			}
		}

		console.log(`\n✅ ${count} salons d'arcs mis à jour avec leurs images wiki`)
	} catch (err) {
		console.error('Erreur:', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

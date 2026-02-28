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

const ARC_DATA: Record<string, { description: string, image: string }> = {
	'macao-à-galuna': {
		description: 'Lucy débarque à Fairy Tail, rencontre Natsu et sa bande de tarés, et ils partent sauver Macao puis s\'attaquer à une mission de rang S sur l\'Île de Galuna sans permission. Gray affronte son passé avec Deliora et Lyon.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/8/89/Galuna_Island_arc.png/revision/latest?cb=20160910130035',
	},
	'phantom-lord': {
		description: 'Phantom Lord attaque la guilde et kidnappe Lucy pour la ramener à son père. Natsu pète un câble, Gajeel et Juvia débarquent comme ennemis, et c\'est la guerre totale entre les deux guildes. Le début de la vraie team Fairy Tail.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/b/bb/Fairy_Tail_Guild_wrecked_by_Phantom_Lord.jpg/revision/latest?cb=20100313114501',
	},
	'tour-du-paradis': {
		description: 'Erza se fait enlever par Jellal, son ancien ami d\'enfance devenu complètement fou. Il veut la sacrifier pour ressusciter Zeref dans la Tour du Paradis. Natsu met tout en jeu pour la sauver et on découvre enfin le passé d\'Erza.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/c/c6/Tower_of_Heaven_arc_-_Final_Ending.png/revision/latest?cb=20160326143518',
	},
	'battle-of-fairy-tail': {
		description: 'Laxus pète les plombs pendant le festival de Magnolia et force les membres de la guilde à s\'entretuer. Avec le Raijin Tribe, il prend la ville en otage. C\'est Fairy Tail contre Fairy Tail, et ça fait très mal au cœur.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/1/1d/The_Battle_of_Fairy_Tail_arc_-_Final_Ending.png/revision/latest?cb=20160326143516',
	},
	'oración-seis': {
		description: 'Fairy Tail forme une alliance avec Blue Pegasus, Lamia Scale et Cait Shelter pour détruire la guilde noire Oración Seis. Wendy et Carla rejoignent l\'aventure, et le Nirvana menace de tout retourner.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/b/b7/The_Oración_Seis.png/revision/latest?cb=20111225000638',
	},
	'edolas': {
		description: 'Toute la ville de Magnolia est aspirée dans un monde parallèle où la magie est limitée. Natsu, Wendy, Happy et Carla doivent sauver tout le monde dans Edolas, où chaque personnage a un double inversé. Mystogan révèle enfin qui il est vraiment.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/4/41/Erza_Knightwalker.png/revision/latest?cb=20111211173831',
	},
	'île-tenrô': {
		description: 'L\'examen de rang S commence sur l\'Île Tenrô, mais Grimoire Heart et même Acnologia débarquent pour tout gâcher. On découvre la tombe de Mavis, et la guilde disparaît pendant sept ans. L\'un des arcs les plus intenses de la série.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/e/e0/Tenrou_Island_Banner.png/revision/latest?cb=20130105221735',
	},
	'grands-jeux-magiques': {
		description: 'Fairy Tail revient après 7 ans d\'absence et participe aux Grands Jeux Magiques pour retrouver sa gloire. Sabertooth et les Dragon Twins leur mettent la pression, et un mystérieux pouvoir se cache derrière le tournoi.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/e/ea/Grand_Magic_Games_banner.png/revision/latest?cb=20130111223643',
	},
	'éclipse': {
		description: 'Après les Jeux, les esprits célestes de Lucy changent d\'apparence et de personnalité à cause de l\'Eclipse. Ils rompent leurs contrats et deviennent incontrôlables. Lucy doit tout faire pour récupérer ses amis stellaires.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/2/28/Eclipse_Celestial_Spirits_arc.png/revision/latest?cb=20141025053406',
	},
	'tartaros': {
		description: 'La guilde noire Tartaros attaque le Conseil de la magie et élimine presque tout le monde. Les Neuf Portes Démoniaques sont terrifiantes, et Natsu découvre la vérité sur E.N.D. La guilde est dissoute à la fin.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/4/40/Tartaros_arc_Poster.png/revision/latest?cb=20150516102311',
	},
	'arbaless': {
		description: 'L\'arc final de Fairy Tail. L\'Empire Arbaless et ses Spriggan 12 lancent une guerre totale contre Ishgar. Zeref et Acnologia sont les boss finaux, et tout le monde donne absolument tout.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/2/20/Alvarez_Empire_arc.png/revision/latest?cb=20190412155913',
	},
	'100-years-quest': {
		description: 'Un an après Zeref et Acnologia, la Team Natsu part sur le continent de Guiltina pour la Quête de 100 Ans. Ils doivent sceller les Cinq Dieux Dragons, des menaces encore plus grandes que tout ce qu\'ils ont affronté.',
		image: 'https://static.wikia.nocookie.net/fairytail/images/0/02/Fairy-tail-100-years-quest.png/revision/latest?cb=20180717161502',
	},
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

			const arcKey = Object.keys(ARC_DATA).find(key => tc.name.includes(key))
			if (!arcKey) continue

			const arc = ARC_DATA[arcKey]

			const messages = await tc.messages.fetch({ limit: 5 }).catch(() => null)
			if (!messages) continue

			for (const [, msg] of messages) {
				if (msg.author.id !== client.user!.id) continue
				if (msg.embeds.length === 0) continue

				const newEmbed = new EmbedBuilder()
					.setTitle(`#${tc.name}`)
					.setDescription(arc.description)
					.setColor(0xE8672A)
					.setImage(arc.image)

				try {
					await msg.edit({ embeds: [newEmbed] })
					count++
					console.log(`  ✅ #${tc.name}`)
				} catch (err: any) {
					console.error(`  ❌ #${tc.name}: ${err.message}`)
				}
				await sleep(300)
				break
			}
		}

		console.log(`\n✅ ${count} salons d'arcs mis à jour`)
	} catch (err) {
		console.error('Erreur:', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

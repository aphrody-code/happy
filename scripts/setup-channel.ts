import 'dotenv/config'

import { Client, EmbedBuilder, GatewayIntentBits, TextChannel } from 'discord.js'

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

const CHANNEL_ID = '1477117909070516325'

const rulesPart1 = [
	'# 📜 RÈGLEMENT DE LA GUILDE FAIRY TAIL FR',
	'',
	'*Bienvenue parmi nous, mage ! Intégrer Fairy Tail n\'est pas seulement rejoindre un serveur, c\'est devenir membre d\'une famille turbulente mais soudée. Voici les principes que chaque membre doit graver dans son cœur.*',
	'',
	'### ⚖️ LES 3 LOIS FONDAMENTALES (SERMENT D\'ADIEU)',
	'*Ces règles s\'appliquent à tout membre, présent ou futur. Les trahir, c\'est trahir la guilde.*',
	'1. **LE SECRET PROFESSIONNEL :** Tu ne devras jamais révéler à des tiers des informations obtenues au sein de la guilde qui pourraient lui porter préjudice. Ce qui se passe à Magnolia reste à Magnolia.',
	'2. **LA LOYAUTÉ COMMERCIALE :** Tu ne devras pas détourner les membres ou les projets de la guilde à des fins personnelles ou pour le compte d\'une organisation rivale.',
	'3. **LA FRATERNITÉ ÉTERNELLE :** Même si nos routes se séparent, tu ne devras jamais baisser les bras. Garde foi en toi-même et n\'oublie jamais tes camarades.',
	'',
	'### 🧚 LA PHILOSOPHIE DU MAÎTRE MAKAROF',
	'*   **LA LIBERTÉ AVANT TOUT :** La magie (et la parole) est une expression de soi. Nous encourageons les débats et la créativité, tant qu\'ils restent dans le respect. (Attention : les dégâts matériels excessifs seront facturés !).',
	'*   **LA FAMILLE :** "Les larmes d\'un seul sont les larmes de tous." L\'entraide est obligatoire. Harcèlement, insultes et comportements toxiques entraînent une exclusion immédiate par le Conseil des Mages.',
	'*   **LE DROIT À L\'ERREUR :** Tout le monde peut racheter son passé ici. Mais une fois membre, tu représentes l\'honneur de la marque que tu portes.',
].join('\n')

const rulesPart2 = [
	'### ⚔️ STRUCTURE ET TRADITIONS',
	'*   **LA MARQUE DE LA GUILDE :** Chaque membre doit obtenir ses rôles via la commande `/guilde`. C\'est ton tatouage virtuel, porte-le avec fierté !',
	'*   **LE TABLEAU DES MISSIONS :** Respecte les salons thématiques. Ne poste pas de théories dans le bar de la guilde, utilise les salons dédiés.',
	'*   **LE SALUT DE FAIRY TAIL :** 👆 (Index vers le ciel). Ce signe signifie : *"Même si je ne te vois pas, je te regarde toujours."* Soyez bienveillants envers les membres absents ou en difficulté.',
	'',
	'### ⚖️ LE CONSEIL DES MAGES (MODÉRATION)',
	'*Le Conseil des Mages (Staff) veille au grain. Leurs décisions sont finales.*',
	'*   **PAS DE SPAM :** Ne sois pas aussi bruyant que Natsu et Grey en pleine bagarre.',
	'*   **SPOILERS :** Utilise obligatoirement le salon `⚠️・spoilers` pour tout contenu non encore diffusé dans l\'anime.',
	'*   **PUBLICITÉ :** Interdiction de faire de la publicité pour d\'autres guildes (serveurs) sans l\'accord du Maître.',
	'',
	'---',
	'*En restant sur ce serveur, tu acceptes de suivre ces principes. Maintenant, va prendre une mission au tableau et fais honneur à Fairy Tail ! **AYE !***',
].join('\n')

client.once('ready', async () => {
	console.log('Bot connecté.')
	try {
		const channel = await client.channels.fetch(CHANNEL_ID)
		if (channel && channel instanceof TextChannel) {
			console.log(`Configuration du salon ${channel.name}...`)
			await channel.send({ content: rulesPart1 })
			await channel.send({ content: rulesPart2 })
			await channel.setTopic('Règlement officiel de la guilde Fairy Tail FR — lisez avant de participer')

			const infoEmbed = new EmbedBuilder()
				.setTitle('Information supplémentaire')
				.setDescription('N\'oubliez pas d\'utiliser la commande `/guilde` pour rejoindre votre camp et obtenir vos accès aux salons de guilde !')
				.setColor(0xE8672A)
			await channel.send({ embeds: [infoEmbed] })

			console.log('Succès : Salon configuré.')
		} else {
			console.error('Erreur : Salon introuvable.')
		}
	} catch (err) {
		console.error('Erreur :', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

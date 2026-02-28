import 'dotenv/config'

import {
	ActionRowBuilder,
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	StringSelectMenuBuilder,
	TextChannel,
} from 'discord.js'

// @ts-expect-error
import { fairyTailGuildes } from '../src/configs/guildes'

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

const CHANNEL_ID = '1477117909988802565'

client.once('ready', async () => {
	console.log('Bot connecté pour la configuration du salon rôles...')
	try {
		const channel = await client.channels.fetch(CHANNEL_ID)
		if (channel && channel instanceof TextChannel) {
			console.log(`Configuration du salon ${channel.name}...`)

			const description = [
				'Bienvenue mage ! Pour participer pleinement à la vie de la cité et débloquer tes accès, tu dois choisir une guilde.',
				'',
				'**Comment faire ?**',
				'1. Utilise les menus déroulants ci-dessous pour choisir ta guilde.',
				'2. Tu recevras automatiquement le rôle et la couleur associés.',
				'3. Tu ne peux appartenir qu\'à **une seule guilde** à la fois.',
				'',
				'*Note : Tu peux changer de guilde à tout moment, mais sache que la loyauté est une vertu appréciée chez Fairy Tail !*',
			].join('\n')

			const embed = new EmbedBuilder()
				.setTitle('⚔️ REJOINDRE UNE GUILDE')
				.setDescription(description)
				.setColor(0xE8672A)
				.setThumbnail('https://i.pinimg.com/originals/a1/bd/f1/a1bdf1d65acd999c00c627b11998cd3b.gif')
				.setFooter({ text: 'Système de Guildes Fairy Tail FR' })

			const legalGuildes = fairyTailGuildes.filter((g: any) => g.type === 'legale')
			const otherGuildes = fairyTailGuildes.filter((g: any) => g.type !== 'legale')

			const legalMenu = new StringSelectMenuBuilder()
				.setCustomId('guilde-select-legal')
				.setPlaceholder('🛡️ Choisir une Guilde Légale...')
				.addOptions(legalGuildes.slice(0, 25).map((g: any) => ({
					label: g.name,
					value: g.id,
					description: g.description.substring(0, 100),
					emoji: g.emoji,
				})))

			const darkMenu = new StringSelectMenuBuilder()
				.setCustomId('guilde-select-dark')
				.setPlaceholder('💀 Choisir une Guilde Noire ou Indépendante...')
				.addOptions(otherGuildes.slice(0, 25).map((g: any) => ({
					label: g.name,
					value: g.id,
					description: g.description.substring(0, 100),
					emoji: g.emoji,
				})))

			const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(legalMenu)
			const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(darkMenu)

			await channel.send({
				embeds: [embed],
				components: [row1, row2],
			})

			await channel.setTopic('Obtenez votre marque de guilde ici — /guilde')

			console.log('Succès : Salon rôles configuré.')
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

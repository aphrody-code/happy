import 'dotenv/config'

import {
	ChannelType,
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	type GuildChannel,
	type Message,
	TextChannel,
} from 'discord.js'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] })
const GUILD_ID = process.env.TEST_GUILD_ID!

function findChannel(channels: Map<string, GuildChannel>, name: string): TextChannel | null {
	const ch = [...channels.values()].find(c => c.name.includes(name) && c.type === ChannelType.GuildText)

	return (ch as TextChannel) ?? null
}

function mention(channels: Map<string, GuildChannel>, name: string): string {
	const ch = [...channels.values()].find(c => c.name.includes(name))

	return ch ? `<#${ch.id}>` : `\`#${name}\``
}

async function sleep(ms: number) {
	return new Promise(r => setTimeout(r, ms))
}

client.once('ready', async () => {
	console.log(`Bot connecté : ${client.user!.tag}`)

	try {
		const guild = await client.guilds.fetch(GUILD_ID)
		await guild.channels.fetch()
		const channels = guild.channels.cache as Map<string, GuildChannel>

		const bienvenue = findChannel(channels, 'bienvenue')
		if (!bienvenue) {
			console.log('❌ #bienvenue introuvable')

			return
		}

		// Récupérer les messages existants du bot
		const existing: Message[] = []
		let lastId: string | undefined
		while (true) {
			const batch = await bienvenue.messages.fetch({ limit: 100, ...(lastId ? { before: lastId } : {}) })
			if (batch.size === 0) break
			for (const [, msg] of batch) {
				if (msg.author.id === client.user!.id) existing.push(msg)
			}
			lastId = batch.last()!.id
			if (batch.size < 100) break
		}

		// Supprimer les anciens messages du bot
		if (existing.length > 0) {
			console.log(`Suppression de ${existing.length} ancien(s) message(s)...`)
			for (const msg of existing) {
				await msg.delete().catch(() => {})
				await sleep(300)
			}
		}

		const m = (name: string) => mention(channels, name)

		// ── Embeds en ton humain ──
		const embedAccueil = new EmbedBuilder()
			.setColor(0xE8672A)
			.setTitle('Bienvenue à Fairy Tail FR')
			.setDescription(
				'Yo ! Moi c\'est **Happy**, le chat bleu de la guilde. '
				+ 'Viens, je te fais visiter avant que Natsu crame le bâtiment... encore.\n\n'
				+ '> *« Les fées ont-elles une queue ? Existent-elles seulement ?*\n'
				+ '> *Comme elles, cet endroit est un mystère éternel... une aventure sans fin ! »*\n'
				+ '> — Maître Makarof'
			)
			.setThumbnail(client.user?.displayAvatarURL() ?? null)

		const embedLore = new EmbedBuilder()
			.setColor(0x2C3E50)
			.setTitle('La guilde')
			.setDescription(
				'Fairy Tail, c\'est **la guilde la plus forte de Fiore**. '
				+ 'Elle est installée à Magnolia, une petite ville côtière, depuis sa fondation en Avril X686 '
				+ 'par Mavis Vermillion, Precht, Worlod et Yûri Draer.\n\n'
				+ 'Le nom vient d\'une question toute bête : est-ce que les fées ont une queue ? '
				+ 'Personne sait, et c\'est justement ça le truc — chercher la réponse, '
				+ 'c\'est déjà l\'aventure.\n\n'
				+ 'Le bâtiment a été détruit et reconstruit 4 fois (merci Phantom Lord, Gildarts, '
				+ 'et Tartaros...). Au rez-de-chaussée y\'a le bar de Mira, le tableau des quêtes '
				+ 'et la scène du Maître. Et la guilde possède aussi l\'Île Tenrô, '
				+ 'là où repose Mavis et où se passe l\'examen de Rang S.'
			)

		const embedServeur = new EmbedBuilder()
			.setColor(0x9B59B6)
			.setTitle('Le serveur')
			.setDescription(
				'Ici c\'est le QG de la communauté francophone Fairy Tail. '
				+ 'On parle manga, anime, 100 Years Quest, on débat sur les arcs, '
				+ 'on partage du fan-art et des théories.\n\n'
				+ 'Y\'a aussi un **système de guildes** avec des rôles dédiés, '
				+ 'et un **RPG textuel** où tu peux explorer Fiore, '
				+ 'faire des quêtes et gagner des Joyaux.\n\n'
				+ 'Et comme à Magnolia, on a notre propre Fantasia — '
				+ 'on célèbre ensemble, tout simplement.'
			)

		const embedGuildes = new EmbedBuilder()
			.setColor(0xF39C12)
			.setTitle('Choisis ta guilde')
			.setDescription(
				`Fais **/guilde** dans ${m('rôles')} pour porter ta marque.\n\n`
				+ '**Légales** — Fairy Tail, Saber Tooth, Lamia Scale, Blue Pegasus, Quatro Cerberus, Mermaid Heel\n'
				+ '**Noires** — Grimoire Heart, Tartaros, Oración Seis, Crime Sorcière, Raven Tail\n\n'
				+ 'Et rappelle-toi les 3 lois quand tu quittes une guilde :\n'
				+ '> 1. Ne jamais révéler d\'infos qui pourraient nuire à la guilde.\n'
				+ '> 2. Ne jamais détourner les membres à des fins perso.\n'
				+ '> 3. *Ne baisse jamais les bras. Garde foi en toi-même. '
				+ 'Ta vie est précieuse — et n\'oublie jamais ceux qui te sont chers.*'
			)

		const embedRpg = new EmbedBuilder()
			.setColor(0x8E44AD)
			.setTitle('Le RPG')
			.setDescription(
				'T\'es pas juste un membre ici, t\'es un **mage de Fiore**.\n\n'
				+ `Tape **/rpg** dans ${m('commandes-rpg')} pour commencer. `
				+ 'Tu démarres à Magnolia — tu peux traîner à la guilde avec Natsu et Lucy, '
				+ 'prendre le train pour Crocus, explorer le parc, pêcher du poisson...\n\n'
				+ 'Tu gagnes de l\'XP et des Joyaux au fur et à mesure. '
				+ `Les missions dispo sont dans ${m('quêtes-rpg')}.`
			)

		const embedRangs = new EmbedBuilder()
			.setColor(0xE74C3C)
			.setTitle('Les rangs')
			.setDescription(
				'Comme dans la vraie guilde, y\'a une hiérarchie :\n\n'
				+ '⭐ Nouveau Mage → ⚔️ Mage Confirmé → 🌟 Rang S → 👑 Conseil des Mages → 🧙 Maître\n\n'
				+ 'Les Rang S originaux c\'est Gildarts, Luxus, Erza, Mirajane et Mystogan. '
				+ 'L\'examen se passe sur l\'Île Tenrô. Bonne chance pour y arriver.'
			)

		const embedRegles = new EmbedBuilder()
			.setColor(0xC0392B)
			.setTitle('Les règles (version courte)')
			.setDescription(
				'On est une famille, mais même Fairy Tail a ses règles.\n\n'
				+ '**1.** Respecte tout le monde. Pas d\'insultes, pas de harcèlement.\n'
				+ '**2.** Pas de spam. Sois pas comme Natsu et Grey en pleine baston.\n'
				+ `**3.** Les spoilers c\'est dans ${m('spoilers')}, nulle part ailleurs.\n`
				+ '**4.** Pas de pub pour d\'autres serveurs sans autorisation.\n\n'
				+ `Le règlement complet est dans ${m('règles')}.`
			)

		const embedPremiersPas = new EmbedBuilder()
			.setColor(0x2ECC71)
			.setTitle('Par où commencer ?')
			.setDescription(
				`**1.** Lis le règlement dans ${m('règlement')}\n`
				+ `**2.** Présente-toi dans ${m('présentations')}\n`
				+ `**3.** Choisis ta guilde avec **/guilde** dans ${m('rôles')}\n`
				+ `**4.** Lance **/rpg explorer** dans ${m('commandes-rpg')}\n`
				+ `**5.** Essaie **/happy** dans ${m('commandes')}\n\n`
				+ 'Si t\'es paumé, ping un membre du staff (Conseil des Mages). '
				+ 'On est là pour aider. 🐟'
			)

		const embedFooter = new EmbedBuilder()
			.setColor(0xE8672A)
			.setDescription(
				'# 👆 FAIRY TAIL !\n\n'
				+ '> *« Même si je ne te vois pas... je te regarde toujours. »*\n'
				+ '> — Mavis Vermillion\n\n'
				+ '-# Aye Sir ! — Happy 🐟'
			)

		// ── Envoi ──
		await bienvenue.send({ embeds: [embedAccueil] })
		await sleep(500)
		await bienvenue.send({ embeds: [embedLore, embedServeur] })
		await sleep(500)
		await bienvenue.send({ embeds: [embedGuildes, embedRpg] })
		await sleep(500)
		await bienvenue.send({ embeds: [embedRangs, embedRegles] })
		await sleep(500)
		await bienvenue.send({ embeds: [embedPremiersPas, embedFooter] })

		console.log('✅ Embeds de bienvenue envoyés dans #bienvenue !')
	} catch (err) {
		console.error('Erreur:', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

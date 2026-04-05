/**
 * Script master de setup du serveur Fairy Tail FR.
 * Exécute en séquence :
 *   1. Création des catégories et salons depuis SERVER_STRUCTURE
 *   2. Envoi des embeds de bienvenue (#bienvenue)
 *   3. Envoi du contenu des salons INFORMATIONS (#règles, #annonces, #guildes, #personnages, #actus)
 *   4. Envoi des embeds Twitter (#twitter-fairy-tail)
 *   5. Envoi d'un message d'accueil dans chaque salon vide
 *
 * Usage: npx tsx scripts/setup-all.ts [--skip-channels] [--skip-welcome] [--skip-info] [--skip-twitter] [--skip-empty]
 */
import 'dotenv/config'

import {
	ChannelType,
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	GuildChannel,
	OverwriteType,
	PermissionFlagsBits,
	TextChannel,
} from 'discord.js'

import { CHANNEL_NAMES, SERVER_STRUCTURE } from '../src/configs/serverStructure'

const GUILD_ID = process.env.TEST_GUILD_ID!
const args = process.argv.slice(2)
const skip = (flag: string) => args.includes(`--skip-${flag}`)

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

// ── Helpers ──

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

// ── Etape 1 : Création des salons ──

async function setupChannels(guild: import('discord.js').Guild) {
	console.log('\n━━━ ÉTAPE 1 : Création des salons ━━━\n')

	let createdCategories = 0
	let createdChannels = 0
	let skippedChannels = 0

	for (const categoryDef of SERVER_STRUCTURE) {
		// Chercher la catégorie existante
		let category = guild.channels.cache.find(
			c => c.type === ChannelType.GuildCategory && c.name === categoryDef.name
		)

		if (!category) {
			category = await guild.channels.create({
				name: categoryDef.name,
				type: ChannelType.GuildCategory,
				permissionOverwrites: categoryDef.adminOnly
					? [
							{ id: guild.id, deny: [PermissionFlagsBits.ViewChannel], type: OverwriteType.Role },
							{ id: client.user!.id, allow: [PermissionFlagsBits.ViewChannel], type: OverwriteType.Member },
						]
					: undefined,
			})
			createdCategories++
			console.log(`📂 Catégorie créée : ${categoryDef.name}`)
		} else {
			console.log(`📂 Catégorie existante : ${categoryDef.name}`)
		}

		for (const channelDef of categoryDef.channels) {
			const existing = guild.channels.cache.find(
				c => c.name === channelDef.name && c.parentId === category!.id
			)

			if (existing) {
				skippedChannels++
				continue
			}

			await guild.channels.create({
				name: channelDef.name,
				type: channelDef.type as any,
				parent: category.id,
				topic: channelDef.topic ?? undefined,
			})
			createdChannels++
			console.log(`  ✅ ${channelDef.name}`)
			await sleep(300)
		}
	}

	// Rafraîchir le cache après création
	await guild.channels.fetch()

	console.log(`\n📂 ${createdCategories} catégories créées`)
	console.log(`💬 ${createdChannels} salons créés`)
	console.log(`⏭️  ${skippedChannels} salons ignorés (existants)`)
}

// ── Etape 2 : Embeds de bienvenue (#bienvenue) ──

async function setupWelcome(guild: import('discord.js').Guild, channels: Map<string, GuildChannel>) {
	console.log('\n━━━ ÉTAPE 2 : Embeds de bienvenue ━━━\n')

	const channel = findChannel(channels, 'bienvenue')
	if (!channel) {
		console.log('❌ Salon #bienvenue introuvable')

		return
	}

	// Vérifier si déjà configuré
	const existing = await channel.messages.fetch({ limit: 1 })
	if (existing.size > 0) {
		console.log('⏭️  #bienvenue déjà configuré, skip')

		return
	}

	const m = (name: string) => mention(channels, name)

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
			+ `Le règlement complet est dans ${m('règlement')}.`
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
			+ '-# Aye Sir !'
		)

	await channel.send({ embeds: [embedAccueil] })
	await sleep(500)
	await channel.send({ embeds: [embedLore, embedServeur] })
	await sleep(500)
	await channel.send({ embeds: [embedGuildes, embedRpg] })
	await sleep(500)
	await channel.send({ embeds: [embedRangs, embedRegles] })
	await sleep(500)
	await channel.send({ embeds: [embedPremiersPas, embedFooter] })

	console.log('✅ Embeds de bienvenue envoyés dans #bienvenue')
}

// ── Etape 3 : Informations (règles, annonces, guildes, personnages, actus) ──

async function setupInformations(guild: import('discord.js').Guild, channels: Map<string, GuildChannel>) {
	console.log('\n━━━ ÉTAPE 3 : Salons Informations ━━━\n')

	const m = (name: string) => mention(channels, name)

	// ── 📜 Règles ──
	const regles = findChannel(channels, CHANNEL_NAMES.RULES)
	if (regles) {
		const existing = await regles.messages.fetch({ limit: 1 })
		if (existing.size > 0) {
			console.log('⏭️  #règles déjà configuré, skip')
		} else {
			const intro = new EmbedBuilder()
				.setColor(0xE8672A)
				.setTitle('📜 Règlement de la Guilde')
				.setDescription(
					'*Bienvenue, nouveau mage !*\n\n'
					+ 'Tu viens de franchir les portes de **Fairy Tail**, la guilde la plus puissante du Royaume de Fiore. '
					+ 'Ici, nous sommes une famille. Mais même dans une famille, il y a des règles à respecter.\n\n'
					+ '> *« Pense à tes compagnons. Pense à ceux qui se battent à tes côtés ! »*\n'
					+ '> — Erza Scarlet'
				)
				.setThumbnail(client.user?.displayAvatarURL() ?? null)

			const condition = new EmbedBuilder()
				.setColor(0xC0392B)
				.setTitle('🔞 Condition d\'accès')
				.setDescription(
					'**Ce serveur est réservé aux personnes majeures (18 ans et plus).**\n\n'
					+ 'En restant sur ce serveur, tu confirmes avoir au moins 18 ans. '
					+ 'Tout membre mineur sera exclu sans exception.'
				)

			const rules = new EmbedBuilder()
				.setColor(0x3498DB)
				.setTitle('⚖️ Les Règles du Code des Mages')
				.setDescription(
					'**1.** Respect mutuel obligatoire — pas d\'insultes, de harcèlement ou de discrimination.\n'
					+ '**2.** Pas de contenu NSFW en dehors des salons dédiés.\n'
					+ '**3.** Pas de spam, flood ou publicité non autorisée.\n'
					+ '**4.** Pas d\'usurpation d\'identité ou de faux comptes.\n'
					+ '**5.** Utilise les salons appropriés pour chaque sujet.\n'
					+ `**6.** Pas de spoilers sans balise — utilise \`||spoiler||\`. Les spoilers 100YQ c'est dans ${m('spoilers')}.\n`
					+ '**7.** Écoute les instructions du **Conseil des Mages** (modérateurs) et du **Maître de Guilde** (admin).\n'
					+ '**8.** Le français est la langue principale du serveur.\n\n'
					+ '*Le non-respect de ces règles peut mener à un avertissement, un timeout ou un bannissement.*'
				)

			const serment = new EmbedBuilder()
				.setColor(0xFFD700)
				.setTitle('📿 Les 3 Lois du Serment d\'Adieu')
				.setDescription(
					'*Quand un membre quitte la guilde, ces règles restent. Les trahir c\'est trahir Fairy Tail.*\n\n'
					+ '**1.** Ne révèle jamais d\'infos qui pourraient nuire à la guilde. Ce qui se passe à Magnolia reste à Magnolia.\n'
					+ '**2.** Ne détourne pas les membres ou les projets de la guilde pour ton propre compte.\n'
					+ '**3.** Ne baisse jamais les bras. Garde foi en toi-même. Ta vie est précieuse — et n\'oublie jamais ceux qui te sont chers.'
				)

			const philosophie = new EmbedBuilder()
				.setColor(0x9B59B6)
				.setTitle('🧙 La Philosophie du Maître')
				.setDescription(
					'**Liberté** — La magie et la parole sont des expressions de soi. '
					+ 'Débats, créativité, tout ça c\'est encouragé tant que ça reste respectueux.\n\n'
					+ '**Famille** — *« Les larmes d\'un seul sont les larmes de tous. »* '
					+ 'L\'entraide c\'est pas optionnel. Harcèlement, insultes, comportements toxiques → exclusion immédiate.\n\n'
					+ '**Droit à l\'erreur** — Tout le monde peut racheter son passé ici. '
					+ 'Mais une fois membre, tu représentes l\'honneur de la marque que tu portes.'
				)

			const hierarchy = new EmbedBuilder()
				.setColor(0xFFD700)
				.setTitle('👑 Hiérarchie du Serveur')
				.setDescription(
					'**👑 Maître de Guilde** — Le dirigeant suprême du serveur. Décisions finales.\n\n'
					+ '**⚖️ Conseil des Mages** — Les modérateurs. Ils veillent au respect des règles.\n\n'
					+ '**🛡️ Chevalier Runique** — Helpers et modérateurs juniors.\n\n'
					+ '**⭐ Mage de Rang S** — Membres d\'élite qui peuvent aider à la modération.'
				)

			const footer = new EmbedBuilder()
				.setColor(0xE8672A)
				.setDescription(
					'En restant ici, tu acceptes ces règles. '
					+ 'Maintenant va prendre une mission au tableau et fais honneur à Fairy Tail.\n\n'
					+ '> *« La vraie force, c\'est savoir se relever après chaque chute. »*\n'
					+ '> — Natsu Dragneel\n\n'
					+ '-# Aye Sir !'
				)

			await regles.send({ embeds: [intro, condition] })
			await sleep(500)
			await regles.send({ embeds: [rules, serment] })
			await sleep(500)
			await regles.send({ embeds: [philosophie, hierarchy] })
			await sleep(500)
			await regles.send({ embeds: [footer] })
			console.log('✅ #règles configuré')
		}
	} else {
		console.log('❌ Salon #règles introuvable')
	}

	// ── 📢 Annonces ──
	const annonces = findChannel(channels, CHANNEL_NAMES.ANNOUNCEMENTS)
	if (annonces) {
		const existing = await annonces.messages.fetch({ limit: 1 })
		if (existing.size > 0) {
			console.log('⏭️  #annonces déjà configuré, skip')
		} else {
			const ouverture = new EmbedBuilder()
				.setColor(0xE8672A)
				.setTitle('📢 La Guilde Fairy Tail FR est ouverte !')
				.setDescription(
					'Yo les mages !\n\n'
					+ 'Les portes de la guilde sont **officiellement ouvertes**. '
					+ 'Après des mois de construction (et au moins 3 destructions par Natsu), '
					+ 'le bâtiment tient enfin debout.\n\n'
					+ 'Ici c\'est le point de ralliement de la **communauté francophone Fairy Tail**. '
					+ 'On parle manga, anime, 100 Years Quest, on débat, on crée, on s\'amuse.\n\n'
					+ `Commencez par lire les règles dans ${m('règles')}, `
					+ `présentez-vous dans ${m('présentations')}, `
					+ `et choisissez votre guilde dans ${m('guildes')} !`
				)
				.setImage('https://static.wikia.nocookie.net/vsbattles/images/e/e7/Fairy_Tail_New_Banner.jpg/revision/latest/scale-to-width-down/1000?cb=20201002162834')

			const features = new EmbedBuilder()
				.setColor(0x3498DB)
				.setTitle('✨ Ce qui vous attend')
				.setDescription(
					'**🏰 Système de Guildes** — Rejoignez l\'une des 38 guildes avec `/guilde`\n\n'
					+ '**🎬 Anime** — Regardez des épisodes directement avec `/anime`\n\n'
					+ '**🖼️ Frames** — Retrouvez des screenshots d\'épisodes avec `/frame`\n\n'
					+ '**📊 Sondages** — Créez des sondages interactifs avec `/sondage`\n\n'
					+ '**🎫 Tickets** — Besoin d\'aide ? Ouvrez un ticket avec `/ticket`\n\n'
					+ '**🤖 Happy** — Votre compagnon Exceed gère tout ça. Aye !'
				)

			await annonces.send({ embeds: [ouverture, features] })
			console.log('✅ #annonces configuré')
		}
	} else {
		console.log('❌ Salon #annonces introuvable')
	}

	// ── ⚔️ Guildes ──
	const guildes = findChannel(channels, CHANNEL_NAMES.GUILD_SELECT)
	if (guildes) {
		const existing = await guildes.messages.fetch({ limit: 1 })
		if (existing.size > 0) {
			console.log('⏭️  #guildes déjà configuré, skip')
		} else {
			const gIntro = new EmbedBuilder()
				.setColor(0xF39C12)
				.setTitle('⚔️ Le Système de Guildes')
				.setDescription(
					'Sur ce serveur, tu peux **rejoindre n\'importe quelle guilde** et porter fièrement sa marque. '
					+ 'Chaque guilde te donne un **rôle et une couleur unique**.\n\n'
					+ 'Utilise la commande **`/guilde`** pour choisir ta guilde !'
				)

			const legales = new EmbedBuilder()
				.setColor(0x2ECC71)
				.setTitle('✅ Guildes Légales')
				.setDescription(
					'🧚 **Fairy Tail** — La guilde la plus turbulente de Fiore\n'
					+ '🐯 **Saber Tooth** — La guilde la plus puissante de Fiore\n'
					+ '🐍 **Lamia Scale** — La guilde du Nord dirigée par Baba\n'
					+ '🦄 **Blue Pegasus** — La guilde des Trimens élégants\n'
					+ '🐕 **Quattro Cerberos** — La guilde sauvage et déchaînée\n'
					+ '🧜 **Mermaid Heel** — La guilde exclusivement féminine\n'
					+ '🐉 **Magia Dragon** — La guilde fondée par les Dragon Slayers\n'
					+ '😈 **Diabolos** — La guilde des Dragon Eaters\n'
					+ '\n*...et bien d\'autres !*'
				)

			const noires = new EmbedBuilder()
				.setColor(0x8B0000)
				.setTitle('🖤 Guildes Noires')
				.setDescription(
					'📖 **Grimoire Heart** — L\'une des trois grandes guildes noires\n'
					+ '👿 **Tartaros** — La guilde des démons de Zeleph\n'
					+ '☠️ **Blue Skull** — La guilde noire qui terrorisait Magnolia\n'
					+ '👁️ **Succubus Eye** — La guilde noire affiliée à Tartaros\n'
					+ '\n⚖️ **Crime Sorcière** — La guilde indépendante de Jellal'
				)

			const howTo = new EmbedBuilder()
				.setColor(0xE8672A)
				.setTitle('🎯 Comment rejoindre ?')
				.setDescription(
					'**1.** Tape la commande **`/guilde`**\n'
					+ '**2.** Choisis ta guilde dans le menu\n'
					+ '**3.** Tu reçois automatiquement le rôle et la couleur\n\n'
					+ 'Tu peux **changer de guilde** à tout moment !'
				)

			await guildes.send({ embeds: [gIntro, legales] })
			await sleep(500)
			await guildes.send({ embeds: [noires, howTo] })
			console.log('✅ #guildes configuré')
		}
	} else {
		console.log('❌ Salon #guildes introuvable')
	}

	// ── 📖 Personnages ──
	const personnages = findChannel(channels, CHANNEL_NAMES.GALLERY)
	if (personnages) {
		const existing = await personnages.messages.fetch({ limit: 1 })
		if (existing.size > 0) {
			console.log('⏭️  #personnages déjà configuré, skip')
		} else {
			const pIntro = new EmbedBuilder()
				.setColor(0xE8672A)
				.setTitle('📖 Galerie des Mages Emblématiques')
				.setDescription(
					'Voici les mages qui ont marqué l\'histoire de Fairy Tail et du Royaume de Fiore.'
				)

			const core = new EmbedBuilder()
				.setColor(0xE8672A)
				.setTitle('🧚 L\'Équipe la Plus Forte')
				.setDescription(
					'🔥 **Natsu Dragneel** — Dragon Slayer du Feu\n'
					+ '⭐ **Lucy Heartfilia** — Constellationniste\n'
					+ '❄️ **Grey Fullbuster** — Mage de Glace (Ice Make)\n'
					+ '⚔️ **Erza Scarlet** — Titania, Reine des Fées\n'
					+ '🐱 **Happy** — Exceed (c\'est moi !)'
				)

			const rangS = new EmbedBuilder()
				.setColor(0xFFD700)
				.setTitle('🌟 Les Mages de Rang S')
				.setDescription(
					'⚡ **Luxus Draer** — Dragon Slayer de la Foudre\n'
					+ '💥 **Gildarts Clive** — Le mage le plus puissant de Fairy Tail\n'
					+ '😈 **Mirajane Strauss** — La Démone (Satan Soul)\n'
					+ '🎭 **Mystogan** — Le mage mystérieux d\'Edolas'
				)

			const hundredYQ = new EmbedBuilder()
				.setColor(0xE74C3C)
				.setTitle('🔥 100 Years Quest — Les Cinq Dieux Dragons')
				.setDescription(
					'🐉 **Mercphobia** — Dieu Dragon de l\'Eau\n'
					+ '🐉 **Aldoron** — Dieu Dragon du Bois\n'
					+ '🐉 **Selene** — Déesse Dragon de la Lune\n'
					+ '🐉 **Ignia** — Dieu Dragon du Feu (fils d\'Igneel)\n'
					+ '🐉 **Viernes** — Dieu Dragon de l\'Or'
				)

			await personnages.send({ embeds: [pIntro, core] })
			await sleep(500)
			await personnages.send({ embeds: [rangS, hundredYQ] })
			console.log('✅ #personnages configuré')
		}
	} else {
		console.log('❌ Salon #personnages introuvable')
	}

	// ── 📰 Actus ──
	const actus = findChannel(channels, CHANNEL_NAMES.NEWS)
	if (actus) {
		const existing = await actus.messages.fetch({ limit: 1 })
		if (existing.size > 0) {
			console.log('⏭️  #actus déjà configuré, skip')
		} else {
			const aIntro = new EmbedBuilder()
				.setColor(0xE8672A)
				.setTitle('📰 Bienvenue dans les Actus')
				.setDescription(
					'Ici on partage les **dernières nouvelles** de l\'univers Fairy Tail.\n\n'
					+ 'Nouveaux chapitres, annonces d\'anime, événements, collaborations... '
					+ 'Tout ce qui se passe dans le Royaume de Fiore, c\'est ici.'
				)

			const etat = new EmbedBuilder()
				.setColor(0x3498DB)
				.setTitle('📺 État des lieux — Fairy Tail en 2025-2026')
				.setDescription(
					'**Manga** — *100 Years Quest* en cours dans le Weekly Shōnen Magazine.\n\n'
					+ '**Anime** — L\'adaptation de *100 Years Quest* par **J.C. Staff** est en cours !\n\n'
					+ '*Les news seront postées ici au fur et à mesure. Restez connectés !*'
				)

			await actus.send({ embeds: [aIntro, etat] })
			console.log('✅ #actus configuré')
		}
	} else {
		console.log('❌ Salon #actus introuvable')
	}
}

// ── Etape 4 : Twitter (#twitter-fairy-tail) ──

async function setupTwitter(guild: import('discord.js').Guild, channels: Map<string, GuildChannel>) {
	console.log('\n━━━ ÉTAPE 4 : Embeds Twitter ━━━\n')

	const channel = findChannel(channels, 'twitter-fairy-tail')
	if (!channel) {
		console.log('❌ Salon #twitter-fairy-tail introuvable')

		return
	}

	const existing = await channel.messages.fetch({ limit: 1 })
	if (existing.size > 0) {
		console.log('⏭️  #twitter-fairy-tail déjà configuré, skip')

		return
	}

	const embed = new EmbedBuilder()
		.setColor(0x1DA1F2)
		.setTitle('🐦 Communauté X : Fairy Tail France')
		.setDescription(
			'Notre guilde s\'étend au-delà de Discord ! Rejoignez la **communauté Fairy Tail France** '
			+ 'sur X (Twitter), le point de ralliement de la fanbase francophone.\n\n'
			+ '🔗 **[Rejoindre la communauté](https://x.com/i/communities/1787507243883057561)**'
		)
		.addFields(
			{ name: '👥 Membres', value: '~3 157 mages', inline: true },
			{ name: '🛡️ Modérateurs', value: '3', inline: true },
			{ name: '📅 Créée le', value: '6 mai 2024', inline: true }
		)
		.addFields(
			{
				name: '👑 Administrateurs',
				value:
					'**Yoyo** — [@yoyo__goat](https://x.com/yoyo__goat)\n'
					+ '**ZERO** — [@childofmiraxus](https://x.com/childofmiraxus)',
			}
		)
		.setThumbnail('https://i.pinimg.com/originals/a1/bd/f1/a1bdf1d65acd999c00c627b11998cd3b.gif')
		.setImage('https://static.wikia.nocookie.net/vsbattles/images/e/e7/Fairy_Tail_New_Banner.jpg/revision/latest/scale-to-width-down/1000?cb=20201002162834')

	await channel.send({ embeds: [embed] })

	console.log('✅ Embeds Twitter envoyés dans #twitter-fairy-tail')
}

// ── Etape 5 : Messages d'accueil dans les salons vides ──

async function setupEmptyChannels(guild: import('discord.js').Guild, channels: Map<string, GuildChannel>) {
	console.log('\n━━━ ÉTAPE 5 : Salons vides ━━━\n')

	const channelDefs = SERVER_STRUCTURE.flatMap(cat => cat.channels)
	let count = 0

	for (const [, ch] of channels) {
		if (ch.type !== ChannelType.GuildText) continue
		const textChannel = ch as TextChannel

		const messages = await textChannel.messages.fetch({ limit: 1 }).catch(() => null)
		if (messages && messages.size === 0) {
			const def = channelDefs.find(d => d.name === textChannel.name)

			const embed = new EmbedBuilder()
				.setTitle(`#${textChannel.name}`)
				.setDescription(
					def?.topic
						? `${def.topic}\n\nAllez, c'est à vous !`
						: 'Bienvenue dans ce salon de la guilde.'
				)
				.setColor(0xE8672A)

			await textChannel.send({ embeds: [embed] })
			count++
			console.log(`  ✅ #${textChannel.name}`)
			await sleep(500)
		}
	}

	console.log(`\n✅ ${count} salons vides configurés`)
}

// ── Main ──

client.once('ready', async () => {
	console.log(`\n🤖 Bot connecté : ${client.user!.tag}`)
	console.log(`🏠 Guild : ${GUILD_ID}\n`)

	try {
		const guild = await client.guilds.fetch(GUILD_ID)
		await guild.channels.fetch()

		// Étape 1 : Créer les salons
		if (!skip('channels')) {
			await setupChannels(guild)
			await guild.channels.fetch() // Rafraîchir le cache
		} else {
			console.log('\n⏭️  Création des salons skippée (--skip-channels)')
		}

		const channels = guild.channels.cache as Map<string, GuildChannel>

		// Étape 2 : Bienvenue
		if (!skip('welcome')) {
			await setupWelcome(guild, channels)
		} else {
			console.log('\n⏭️  Bienvenue skippée (--skip-welcome)')
		}

		// Étape 3 : Informations (règles, annonces, guildes, personnages, actus)
		if (!skip('info')) {
			await setupInformations(guild, channels)
		} else {
			console.log('\n⏭️  Informations skippées (--skip-info)')
		}

		// Étape 4 : Twitter
		if (!skip('twitter')) {
			await setupTwitter(guild, channels)
		} else {
			console.log('\n⏭️  Twitter skippé (--skip-twitter)')
		}

		// Étape 5 : Salons vides
		if (!skip('empty')) {
			await setupEmptyChannels(guild, channels)
		} else {
			console.log('\n⏭️  Salons vides skippés (--skip-empty)')
		}

		console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.log('🎉 SETUP COMPLET ! Aye Sir !')
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
	} catch (err) {
		console.error('❌ Erreur :', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

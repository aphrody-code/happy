/**
 * Peuple les salons de la catégorie 📌 INFORMATIONS avec du contenu riche.
 * Salons ciblés : #règles, #annonces, #guildes, #personnages, #actus
 *
 * Usage: npx tsx scripts/setup-informations.ts [--force]
 *   --force : supprime les anciens messages du bot avant de renvoyer
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

function mention(channels: Map<string, GuildChannel>, name: string): string {
	const ch = [...channels.values()].find(c => c.name.includes(name))
	return ch ? `<#${ch.id}>` : `\`#${name}\``
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

// ── 📜 Règles ──

async function setupRegles(channel: TextChannel, channels: Map<string, GuildChannel>) {
	console.log('\n📜 Setup #règles...')
	const m = (name: string) => mention(channels, name)

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

	const regles = new EmbedBuilder()
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

	await channel.send({ embeds: [intro, condition] })
	await sleep(500)
	await channel.send({ embeds: [regles, serment] })
	await sleep(500)
	await channel.send({ embeds: [philosophie, hierarchy] })
	await sleep(500)
	await channel.send({ embeds: [footer] })
	console.log('  ✅ #règles configuré')
}

// ── 📢 Annonces ──

async function setupAnnonces(channel: TextChannel, channels: Map<string, GuildChannel>) {
	console.log('\n📢 Setup #annonces...')
	const m = (name: string) => mention(channels, name)

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

	const quoiDeNeuf = new EmbedBuilder()
		.setColor(0x3498DB)
		.setTitle('✨ Ce qui vous attend')
		.setDescription(
			'**🏰 Système de Guildes** — Rejoignez l\'une des 38 guildes de Fairy Tail avec `/guilde`\n\n'
			+ '**🎬 Anime** — Regardez des épisodes directement avec `/anime`\n\n'
			+ '**🖼️ Frames** — Retrouvez des screenshots d\'épisodes avec `/frame`\n\n'
			+ '**📊 Sondages** — Créez des sondages interactifs avec `/sondage`\n\n'
			+ '**🎫 Tickets** — Besoin d\'aide ? Ouvrez un ticket avec `/ticket`\n\n'
			+ '**🤖 Happy** — Votre compagnon Exceed gère tout ça. Aye !'
		)

	const communaute = new EmbedBuilder()
		.setColor(0x1DA1F2)
		.setTitle('🌐 Notre communauté')
		.setDescription(
			'La guilde s\'étend au-delà de Discord !\n\n'
			+ '🐦 **Communauté X** — [Fairy Tail France](https://x.com/i/communities/1787507243883057561) (~3 157 mages)\n\n'
			+ 'Restez connectés pour ne rien rater. Les annonces importantes seront toujours postées ici.'
		)

	await channel.send({ embeds: [ouverture] })
	await sleep(500)
	await channel.send({ embeds: [quoiDeNeuf, communaute] })
	console.log('  ✅ #annonces configuré')
}

// ── ⚔️ Guildes ──

async function setupGuildes(channel: TextChannel) {
	console.log('\n⚔️ Setup #guildes...')

	const intro = new EmbedBuilder()
		.setColor(0xF39C12)
		.setTitle('⚔️ Le Système de Guildes')
		.setDescription(
			'Dans l\'univers de Fairy Tail, les guildes sont des organisations de mages '
			+ 'officiellement reconnues (ou non) par le **Conseil de la Magie**.\n\n'
			+ 'Sur ce serveur, tu peux **rejoindre n\'importe quelle guilde** et porter fièrement sa marque. '
			+ 'Chaque guilde te donne un **rôle et une couleur unique**.\n\n'
			+ 'Utilise la commande **`/guilde`** pour choisir ta guilde !'
		)

	const legales = new EmbedBuilder()
		.setColor(0x2ECC71)
		.setTitle('✅ Guildes Légales')
		.setDescription(
			'*Approuvées par le Conseil de la Magie*\n\n'
			+ '🧚 **Fairy Tail** — La guilde la plus turbulente de Fiore\n'
			+ '🐯 **Saber Tooth** — La guilde la plus puissante de Fiore\n'
			+ '🐍 **Lamia Scale** — La guilde du Nord dirigée par Baba\n'
			+ '🦄 **Blue Pegasus** — La guilde des Trimens élégants\n'
			+ '🐕 **Quattro Cerberos** — La guilde sauvage et déchaînée\n'
			+ '🧜 **Mermaid Heel** — La guilde exclusivement féminine\n'
			+ '🐉 **Magia Dragon** — La guilde fondée par les Dragon Slayers\n'
			+ '😈 **Diabolos** — La guilde des Dragon Eaters\n'
			+ '👹 **Twilight Ogre** — La guilde qui a dominé Magnolia\n'
			+ '💎 **Carbuncle** — Une guilde de chasseurs de trésors\n'
			+ '🔥 **Phoenix Grave** — La guilde du phénix\n'
			+ '💕 **Love & Lucky** — La guilde marchande de Layla Heartfilia\n'
			+ '\n*...et bien d\'autres !*'
		)

	const noires = new EmbedBuilder()
		.setColor(0x8B0000)
		.setTitle('🖤 Guildes Noires')
		.setDescription(
			'*Non approuvées par le Conseil — traitées comme criminelles*\n\n'
			+ '📖 **Grimoire Heart** — L\'une des trois grandes guildes noires\n'
			+ '👿 **Tartaros** — La guilde des démons de Zeleph\n'
			+ '☠️ **Blue Skull** — La guilde noire qui terrorisait Magnolia\n'
			+ '👻 **Ghoul Spirits** — La guilde des esprits morts-vivants\n'
			+ '👁️ **Succubus Eye** — La guilde noire affiliée à Tartaros\n'
			+ '🗡️ **Assassins des Skulls** — La guilde d\'assassins impitoyables\n'
			+ '\n*...et d\'autres dans l\'ombre.*'
		)

	const independante = new EmbedBuilder()
		.setColor(0x2980B9)
		.setTitle('⚖️ Guilde Indépendante')
		.setDescription(
			'**Crime Sorcière** — Fondée par **Jellal Fernandez** après sa rédemption. '
			+ 'Cette guilde agit dans l\'ombre pour combattre les guildes noires et les menaces magiques, '
			+ 'sans être reconnue par le Conseil de la Magie.\n\n'
			+ '*« Nous ne cherchons pas la lumière. Nous la protégeons depuis l\'ombre. »*'
		)

	const comment = new EmbedBuilder()
		.setColor(0xE8672A)
		.setTitle('🎯 Comment rejoindre ?')
		.setDescription(
			'**1.** Tape la commande **`/guilde`**\n'
			+ '**2.** Choisis ta guilde dans le menu\n'
			+ '**3.** Tu reçois automatiquement le rôle et la couleur de ta guilde\n\n'
			+ 'Tu peux **changer de guilde** à tout moment en refaisant `/guilde`.\n\n'
			+ 'Et rappelle-toi les 3 lois quand tu quittes une guilde :\n'
			+ '> 1. Ne jamais révéler d\'infos qui pourraient nuire à la guilde.\n'
			+ '> 2. Ne jamais détourner les membres à des fins perso.\n'
			+ '> 3. *Ne baisse jamais les bras. Garde foi en toi-même.*'
		)

	await channel.send({ embeds: [intro] })
	await sleep(500)
	await channel.send({ embeds: [legales, noires] })
	await sleep(500)
	await channel.send({ embeds: [independante, comment] })
	console.log('  ✅ #guildes configuré')
}

// ── 📖 Personnages ──

async function setupPersonnages(channel: TextChannel) {
	console.log('\n📖 Setup #personnages...')

	const intro = new EmbedBuilder()
		.setColor(0xE8672A)
		.setTitle('📖 Galerie des Mages Emblématiques')
		.setDescription(
			'Voici les mages qui ont marqué l\'histoire de Fairy Tail et du Royaume de Fiore.\n\n'
			+ '> *« La magie n\'est pas un miracle. La volonté de tout accomplir, de tout supporter... '
			+ 'C\'est quand le cœur de l\'utilisateur et la nature de la magie ne font plus qu\'un que la magie naît. »*\n'
			+ '> — Maître Makarof'
		)

	const fairyTailCore = new EmbedBuilder()
		.setColor(0xE8672A)
		.setTitle('🧚 Fairy Tail — L\'Équipe la Plus Forte')
		.setDescription(
			'🔥 **Natsu Dragneel** — *Dragon Slayer du Feu*\n'
			+ 'Le mage le plus imprévisible de Fairy Tail. Élevé par le dragon Igneel, '
			+ 'il se bat avec ses poings enflammés et ne recule jamais devant un combat.\n\n'
			+ '⭐ **Lucy Heartfilia** — *Constellationniste*\n'
			+ 'Héritière de la famille Heartfilia, elle invoque les Esprits Célestes. '
			+ 'Narratrice et cœur émotionnel de l\'histoire.\n\n'
			+ '❄️ **Grey Fullbuster** — *Mage de Glace (Ice Make)*\n'
			+ 'Élève d\'Ul, il crée des armes et structures de glace. '
			+ 'Rival éternel de Natsu et allergique aux vêtements.\n\n'
			+ '⚔️ **Erza Scarlet** — *Titania, Reine des Fées*\n'
			+ 'La mage la plus redoutée de Fairy Tail. Son Ex-Quip lui permet de changer '
			+ 'd\'armure et d\'arme en un instant. Elle possède plus de 200 armures.\n\n'
			+ '🐱 **Happy** — *Exceed*\n'
			+ 'Le chat bleu volant de Natsu. Il adore le poisson et dire « Aye Sir ! ». '
			+ 'C\'est aussi moi, votre bot préféré.'
		)

	const rangS = new EmbedBuilder()
		.setColor(0xFFD700)
		.setTitle('🌟 Les Mages de Rang S')
		.setDescription(
			'⚡ **Luxus Draer** — *Dragon Slayer de la Foudre*\n'
			+ 'Petit-fils de Makarof. D\'abord antagoniste, il est devenu l\'un des piliers de la guilde.\n\n'
			+ '💥 **Gildarts Clive** — *Le mage le plus puissant de Fairy Tail*\n'
			+ 'Sa magie Crash désintègre tout ce qu\'il touche. Le seul à avoir affronté Acnologia et survécu.\n\n'
			+ '😈 **Mirajane Strauss** — *La Démone*\n'
			+ 'Sous ses airs de serveuse douce, elle cache le Satan Soul, un Take Over terrifiant.\n\n'
			+ '🎭 **Mystogan** — *Le mage mystérieux*\n'
			+ 'En réalité Jellal d\'Edolas. Il endormait tout le monde en entrant dans la guilde.'
		)

	const autres = new EmbedBuilder()
		.setColor(0x9B59B6)
		.setTitle('🔮 Autres Personnages Clés')
		.setDescription(
			'👑 **Makarof Draer** — 3ème, 6ème et 8ème Maître de Fairy Tail\n\n'
			+ '✨ **Mavis Vermillion** — Fondatrice et 1ère Maître de Fairy Tail\n\n'
			+ '🗡️ **Jellal Fernandez** — Fondateur de Crime Sorcière, ex-membre du Conseil\n\n'
			+ '📖 **Zeleph Dragneel** — Le mage noir le plus puissant de l\'histoire\n\n'
			+ '🐉 **Acnologia** — Le Dragon de l\'Apocalypse, roi des dragons\n\n'
			+ '💧 **Juvia Lockser** — *Mage d\'eau*, ancienne Phantom Lord, amoureuse de Grey\n\n'
			+ '⚙️ **Gajeel Redfox** — *Dragon Slayer du Fer*, ancien Phantom Lord\n\n'
			+ '📚 **Levy McGarden** — *Mage des Mots (Solid Script)*, rat de bibliothèque'
		)

	const hundredYears = new EmbedBuilder()
		.setColor(0xE74C3C)
		.setTitle('🔥 100 Years Quest')
		.setDescription(
			'L\'aventure continue ! L\'Équipe Natsu s\'est lancée dans la quête centenaire : '
			+ 'sceller les **Cinq Dieux Dragons** qui menacent le monde.\n\n'
			+ '🐉 **Mercphobia** — Dieu Dragon de l\'Eau\n'
			+ '🐉 **Aldoron** — Dieu Dragon du Bois\n'
			+ '🐉 **Selene** — Déesse Dragon de la Lune\n'
			+ '🐉 **Ignia** — Dieu Dragon du Feu (fils d\'Igneel)\n'
			+ '🐉 **Viernes** — Dieu Dragon de l\'Or\n\n'
			+ '*Pas de spoilers ici ! Discussions 100YQ dans les salons dédiés.*'
		)

	await channel.send({ embeds: [intro] })
	await sleep(500)
	await channel.send({ embeds: [fairyTailCore] })
	await sleep(500)
	await channel.send({ embeds: [rangS, autres] })
	await sleep(500)
	await channel.send({ embeds: [hundredYears] })
	console.log('  ✅ #personnages configuré')
}

// ── 📰 Actus ──

async function setupActus(channel: TextChannel) {
	console.log('\n📰 Setup #actus...')

	const intro = new EmbedBuilder()
		.setColor(0xE8672A)
		.setTitle('📰 Bienvenue dans les Actus')
		.setDescription(
			'Ici on partage les **dernières nouvelles** de l\'univers Fairy Tail.\n\n'
			+ 'Nouveaux chapitres, annonces d\'anime, événements, collaborations... '
			+ 'Tout ce qui se passe dans le Royaume de Fiore et au-delà, c\'est ici.'
		)

	const etat = new EmbedBuilder()
		.setColor(0x3498DB)
		.setTitle('📺 État des lieux — Fairy Tail en 2025-2026')
		.setDescription(
			'**Manga**\n'
			+ '📖 *Fairy Tail: 100 Years Quest* — En cours de publication dans le Weekly Shōnen Magazine. '
			+ 'Dessiné par **Atsuo Ueda** sous la supervision de **Hiro Mashima**.\n\n'
			+ '**Anime**\n'
			+ '📺 *Fairy Tail: 100 Years Quest* — L\'adaptation anime est en cours ! '
			+ 'Produit par **J.C. Staff**.\n\n'
			+ '**Jeux**\n'
			+ '🎮 Le monde de Fairy Tail s\'étend aussi dans les jeux vidéo et mobile.\n\n'
			+ '*Les news seront postées ici au fur et à mesure. Restez connectés !*'
		)

	const footer = new EmbedBuilder()
		.setColor(0xE8672A)
		.setDescription(
			'> *« Peu importe la route que tu choisis, vis ta vie à fond. »*\n'
			+ '> — Maître Makarof\n\n'
			+ '-# Les actus sont publiées par le staff. Pas de post membre ici.'
		)

	await channel.send({ embeds: [intro, etat] })
	await sleep(500)
	await channel.send({ embeds: [footer] })
	console.log('  ✅ #actus configuré')
}

// ── Main ──

client.once('ready', async () => {
	console.log(`\n🤖 Bot connecté : ${client.user!.tag}`)
	console.log(`🏠 Guild : ${GUILD_ID}`)
	console.log(`🔄 Mode : ${force ? 'FORCE (remplace les messages existants)' : 'NORMAL (skip si déjà configuré)'}\n`)

	try {
		const guild = await client.guilds.fetch(GUILD_ID)
		await guild.channels.fetch()
		const channels = guild.channels.cache as Map<string, GuildChannel>

		const tasks: { name: string, channel: TextChannel | null, setup: (ch: TextChannel, channels: Map<string, GuildChannel>) => Promise<void> }[] = [
			{ name: CHANNEL_NAMES.RULES, channel: findChannel(channels, CHANNEL_NAMES.RULES), setup: setupRegles },
			{ name: CHANNEL_NAMES.ANNOUNCEMENTS, channel: findChannel(channels, CHANNEL_NAMES.ANNOUNCEMENTS), setup: setupAnnonces },
			{ name: CHANNEL_NAMES.GUILD_SELECT, channel: findChannel(channels, CHANNEL_NAMES.GUILD_SELECT), setup: setupGuildes },
			{ name: CHANNEL_NAMES.GALLERY, channel: findChannel(channels, CHANNEL_NAMES.GALLERY), setup: setupPersonnages },
			{ name: CHANNEL_NAMES.NEWS, channel: findChannel(channels, CHANNEL_NAMES.NEWS), setup: setupActus },
		]

		for (const task of tasks) {
			if (!task.channel) {
				console.log(`❌ Salon ${task.name} introuvable`)
				continue
			}

			if (!force && await hasMessages(task.channel)) {
				console.log(`⏭️  ${task.name} déjà configuré, skip (--force pour remplacer)`)
				continue
			}

			if (force) {
				await clearBotMessages(task.channel)
			}

			await task.setup(task.channel, channels)
			await sleep(1000)
		}

		console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.log('🎉 INFORMATIONS configurées ! Aye Sir !')
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
	} catch (err) {
		console.error('❌ Erreur :', err)
	} finally {
		client.destroy()
		process.exit(0)
	}
})

client.login(process.env.BOT_TOKEN)

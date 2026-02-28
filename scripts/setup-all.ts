/**
 * Script master de setup du serveur Fairy Tail FR.
 * Exécute en séquence :
 *   1. Création des catégories et salons depuis SERVER_STRUCTURE
 *   2. Envoi des embeds de bienvenue (#bienvenue)
 *   3. Envoi du règlement (#règlement)
 *   4. Envoi des embeds Twitter (#twitter-fairy-tail)
 *   5. Envoi d'un message d'accueil dans chaque salon vide
 *
 * Usage: npx tsx scripts/setup-all.ts [--skip-channels] [--skip-welcome] [--skip-rules] [--skip-twitter] [--skip-empty]
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

import { SERVER_STRUCTURE } from '../src/configs/serverStructure'

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

// ── Etape 3 : Règlement (#règlement) ──

async function setupRules(guild: import('discord.js').Guild, channels: Map<string, GuildChannel>) {
	console.log('\n━━━ ÉTAPE 3 : Règlement ━━━\n')

	const channel = findChannel(channels, 'règlement')
	if (!channel) {
		console.log('❌ Salon #règlement introuvable')

		return
	}

	const existing = await channel.messages.fetch({ limit: 1 })
	if (existing.size > 0) {
		console.log('⏭️  #règlement déjà configuré, skip')

		return
	}

	const rulesText = [
		'# Règlement de Fairy Tail FR',
		'',
		'T\'es chez Fairy Tail maintenant. C\'est pas juste un serveur, c\'est une famille — bruyante, chaotique, mais soudée. Y\'a quand même quelques règles à respecter.',
		'',
		'### Condition d\'accès',
		'**Ce serveur est réservé aux personnes majeures (18 ans et plus).** En restant sur ce serveur, tu confirmes avoir au moins 18 ans. Tout membre mineur sera exclu sans exception.',
		'',
		'### Les 3 lois du Serment d\'Adieu',
		'*Quand un membre quitte la guilde, ces règles restent. Les trahir c\'est trahir Fairy Tail.*',
		'**1.** Ne révèle jamais d\'infos qui pourraient nuire à la guilde. Ce qui se passe à Magnolia reste à Magnolia.',
		'**2.** Ne détourne pas les membres ou les projets de la guilde pour ton propre compte.',
		'**3.** Ne baisse jamais les bras. Garde foi en toi-même. Ta vie est précieuse — et n\'oublie jamais ceux qui te sont chers.',
		'',
		'### La philosophie du Maître',
		'**Liberté** — La magie et la parole sont des expressions de soi. Débats, créativité, tout ça c\'est encouragé tant que ça reste respectueux.',
		'**Famille** — « Les larmes d\'un seul sont les larmes de tous. » L\'entraide c\'est pas optionnel. Harcèlement, insultes, comportements toxiques → exclusion immédiate.',
		'**Droit à l\'erreur** — Tout le monde peut racheter son passé ici. Mais une fois membre, tu représentes l\'honneur de la marque que tu portes.',
		'',
		'---',
		'En restant ici, tu acceptes ces règles. Maintenant va prendre une mission au tableau et fais honneur à Fairy Tail. **Aye !**',
	].join('\n')

	await channel.send({ content: rulesText })

	console.log('✅ Règlement envoyé dans #règlement')
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

		// Étape 3 : Règlement
		if (!skip('rules')) {
			await setupRules(guild, channels)
		} else {
			console.log('\n⏭️  Règlement skippé (--skip-rules)')
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

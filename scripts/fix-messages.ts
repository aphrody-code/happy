/**
 * Script pour corriger les messages déjà envoyés :
 * 1. Remplacer l'ancien thumbnail tscord par le GIF Happy
 * 2. Corriger les fautes de français (accents manquants) dans les embeds
 */
import 'dotenv/config'

import {
	ChannelType,
	Client,
	GatewayIntentBits,
	TextChannel,
} from 'discord.js'

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

const GUILD_ID = process.env.TEST_GUILD_ID!
const OLD_THUMB = 'barthofu/tscord'
const NEW_THUMB = 'https://i.pinimg.com/originals/a1/bd/f1/a1bdf1d65acd999c00c627b11998cd3b.gif'

// Corrections de français : ancien texte → nouveau texte
const CORRECTIONS: [string, string][] = [
	// Accents manquants
	['BIENVENUE A LA GUILDE', 'BIENVENUE À LA GUILDE'],
	['C\'est moi, **Happy**, l\'Exceed bleu de la guilde', 'C\'est moi, **Happy**, l\'Exceed bleu de la guilde'],
	['te faire visiter notre foyer a **Magnolia**', 'te faire visiter notre foyer à **Magnolia**'],
	['avant que Natsu ne mette le feu a tout le batiment', 'avant que Natsu ne mette le feu à tout le bâtiment'],
	['Les fees ont-elles vraiment une queue ? Existent-elles vraiment', 'Les fées ont-elles vraiment une queue ? Existent-elles vraiment'],
	['cet endroit est un mystere eternel', 'cet endroit est un mystère éternel'],
	['Une aventure sans fin', 'Une aventure sans fin'],
	['Maitre Makarof Draer, 3e et 6e Maitre de Fairy Tail', 'Maître Makarof Draer, 3e et 6e Maître de Fairy Tail'],
	['Maitre Makarof Draer, 3e Maitre de Fairy Tail', 'Maître Makarof Draer, 3e et 6e Maître de Fairy Tail'],
	// Embed Lore
	['La Guilde la Plus Puissante de Fiore', 'La Guilde la plus puissante de Fiore'],
	['la guilde de mages la plus puissante', 'la guilde de mages la plus puissante'],
	['a environ 4 a 5 km au sud de la cote', 'à environ 4 à 5 km au sud de la côte'],
	['a ete fondee en **Avril X686**', 'a été fondée en **Avril X686**'],
	['1ere Maitresse, la Lumiere des Fees', '1ère Maîtresse, la Lumière des Fées'],
	['2e Maitre (futur Hades)', '2e Maître (futur Hadès)'],
	['Pere de Makarof', 'Père de Makarof'],
	['incarne un mystere eternel', 'incarne un mystère éternel'],
	['les fees existent-elles vraiment', 'les fées existent-elles vraiment'],
	['Cette quete de reponse devient', 'Cette quête de réponse devient'],
	['les larmes d\'un seul sont les larmes de tous', 'les larmes d\'un seul sont les larmes de tous'],
	// Embed Lieux / Bâtiment
	['Le Batiment de la Guilde', 'Le Bâtiment de la Guilde'],
	['Le batiment de Fairy Tail est l\'un des plus grands', 'Le bâtiment de Fairy Tail est l\'un des plus grands'],
	['detruit et reconstruit **quatre fois**', 'détruit et reconstruit **quatre fois**'],
	['**Detruit par Phantom Lord**', '**Détruit par Phantom Lord**'],
	['bombarde le batiment avec des projectiles', 'bombarde le bâtiment avec des projectiles'],
	['**Detruit par Gildarts**', '**Détruit par Gildarts**'],
	['**Detruit par Tartaros**', '**Détruit par Tartaros**'],
	['l\'attaque des demons de Zeleph', 'l\'attaque des démons de Zeleph'],
	['**Reconstruit** — Apres la dissolution', '**Reconstruit** — Après la dissolution'],
	['Le rez-de-chaussee abrite', 'Le rez-de-chaussée abrite'],
	['le **tableau des quetes**', 'le **tableau des quêtes**'],
	['la scene du Maitre', 'la scène du Maître'],
	['Le sous-sol cache la **piscine**', 'Le sous-sol cache la **piscine**'],
	['possede aussi l\'**Ile Tenro**', 'possède aussi l\'**Île Tenrô**'],
	['lieu sacre ou repose la tombe', 'lieu sacré où repose la tombe'],
	['ou se deroule l\'**examen de Rang S**', 'où se déroule l\'**examen de Rang S**'],
	// Embed Serveur
	['C\'est quoi ce serveur', 'C\'est quoi ce serveur'],
	['QG numerique de Fairy Tail FR', 'QG numérique de Fairy Tail FR'],
	['la plus grande communaute francophone dediee', 'la plus grande communauté francophone dédiée'],
	['Debats par **arc narratif**', 'Débats par **arc narratif**'],
	['de Macao a Arbaless', 'de Macao à Arbaless'],
	['systeme de guildes', 'système de guildes'],
	['roles et salons dedies', 'rôles et salons dédiés'],
	['le mythique **Defile de Fantasia**', 'le mythique **Défilé de Fantasia**'],
	['le mythique **Deffile de Fantasia**', 'le mythique **Défilé de Fantasia**'],
	['communaute soudee comme une vraie famille', 'communauté soudée comme une vraie famille'],
	['Chaque annee a Magnolia', 'Chaque année à Magnolia'],
	['un grand defile ou les mages revelent', 'un grand défilé où les mages révèlent'],
	['on celebre ensemble', 'on célèbre ensemble'],
	// Embed Guildes
	['Choisis ta Guilde — La Marque du Mage', 'Choisis ta Guilde — La Marque du Mage'],
	['pour preter serment', 'pour prêter serment'],
	['Les 3 Lois du Serment d\'Adieu', 'Les 3 Lois du Serment d\'Adieu'],
	['Quand un membre quitte la guilde, il doit respecter ces regles', 'Quand un membre quitte la guilde, il doit respecter ces règles'],
	['Ne jamais reveler d\'informations sensibles pouvant porter prejudice', 'Ne jamais révéler d\'informations sensibles pouvant porter préjudice'],
	['Ne jamais entrer en contact avec d\'anciens clients afin d\'en tirer un profit', 'Ne jamais entrer en contact avec d\'anciens clients afin d\'en tirer un profit'],
	['Ne baisse jamais les bras devant l\'adversite', 'Ne baisse jamais les bras devant l\'adversité'],
	['garde foi en toi-meme', 'garde foi en toi-même'],
	['Ta vie est precieuse, prends-en soin', 'Ta vie est précieuse, prends-en soin'],
	['n\'oublie jamais les etres qui te sont chers', 'n\'oublie jamais les êtres qui te sont chers'],
	// Embed RPG
	['L\'Aventure RPG — Deviens un Mage de Fiore', 'L\'Aventure RPG — Deviens un Mage de Fiore'],
	['La ville paisible a environ 4-5 km au sud de la cote', 'La ville paisible à environ 4-5 km au sud de la côte'],
	['le tableau des quetes, et le bureau du Maitre', 'le tableau des quêtes, et le bureau du Maître'],
	['Depart vers Crocus', 'Départ vers Crocus'],
	['peche du poisson frais', 'pêche du poisson frais'],
	['La capitale fleurie', 'La capitale fleurie'],
	['**Progresse** en gagnant', '**Progresse** en gagnant'],
	// Embed Rangs
	['seuls les mages les plus puissants accedent', 'seuls les mages les plus puissants accèdent'],
	['apres avoir reussi l\'**examen de Rang S**', 'après avoir réussi l\'**examen de Rang S**'],
	['sur l\'Ile Tenro', 'sur l\'Île Tenrô'],
	['L\'elite, les plus braves', 'L\'élite, les plus braves'],
	['Les Mages de Rang S originaux', 'Les Mages de Rang S originaux'],
	['Le plus puissant mage de Fairy Tail, sa Magie de Destruction pulverise', 'Le plus puissant mage de Fairy Tail, sa Magie de Destruction pulvérise'],
	['Titania, la Reine des Fees, Magie de Re-equipement', 'Titania, la Reine des Fées, Magie de Rééquipement'],
	['La Demone, Satan Soul', 'La Démone, Satan Soul'],
	['Le mage mysterieux d\'Edolas', 'Le mage mystérieux d\'Edolas'],
	// Embed Règles
	['La Colere d\'Erza', 'La Colère d\'Erza'],
	['meme Fairy Tail a des regles', 'même Fairy Tail a des règles'],
	['On est une famille, mais on a des regles', 'On est une famille, mais même Fairy Tail a des règles'],
	['Fairy Tail est une famille avant tout', 'Fairy Tail est une famille avant tout'],
	['Ne gache pas la surprise', 'Ne gâche pas la surprise'],
	['Lis le reglement complet', 'Lis le règlement complet'],
	// Embed Premiers Pas
	['Tes Premiers Pas a Magnolia', 'Tes Premiers Pas à Magnolia'],
	['Tu viens d\'arriver en ville', 'Tu viens d\'arriver en ville'],
	['**Lis le reglement**', '**Lis le règlement**'],
	['**Presente-toi**', '**Présente-toi**'],
	['a la guilde dans', 'à la guilde dans'],
	['**Decouvre-moi**', '**Découvre-moi**'],
	['On est la pour que ton sejour soit aussi doux', 'On est là pour que ton séjour soit aussi doux'],
	['la cathedrale Kaldia est un bon point de repere', 'la cathédrale Kaldia est un bon point de repère'],
	// Embed Footer
	['Grave la marque de ta guilde sur ton coeur', 'Grave la marque de ta guilde sur ton cœur'],
	['Prepare ton sac vert, grave la marque de ta guilde sur ton coeur', 'Grave la marque de ta guilde sur ton cœur'],
	['Meme si je ne te vois pas... meme si on est loin', 'Même si je ne te vois pas... même si on est loin'],
	['je te regarderai toujours', 'je te regarderai toujours'],
	['Ne en X778 a Extalia', 'Né en X778 à Extalia'],
	['Meme si je ne te vois pas... je te regarde toujours', 'Même si je ne te vois pas... je te regarde toujours'],
	// Salon vides
	['BIENVENUE DANS #', 'BIENVENUE DANS #'],
	['N\'hesite pas a commencer', 'N\'hésite pas à commencer'],
	['N\'hésite pas a commencer', 'N\'hésite pas à commencer'],
	// Divers
	['L\'administrateur supreme', 'L\'administrateur suprême'],
	['Petit-fils de Makarof', 'Petit-fils de Makarof'],
	['Dragon Slayer de la Foudre', 'Dragon Slayer de la Foudre'],
]

function applyCorrections(text: string): string {
	let result = text
	for (const [old, corrected] of CORRECTIONS) {
		if (old !== corrected) {
			result = result.replaceAll(old, corrected)
		}
	}

	return result
}

async function sleep(ms: number) {
	return new Promise(r => setTimeout(r, ms))
}

client.once('ready', async () => {
	console.log(`🤖 Bot connecté : ${client.user!.tag}\n`)

	const guild = await client.guilds.fetch(GUILD_ID)
	const channels = await guild.channels.fetch()

	let totalEdited = 0

	for (const [, ch] of channels) {
		if (!ch || ch.type !== ChannelType.GuildText) continue
		const textCh = ch as TextChannel

		try {
			const msgs = await textCh.messages.fetch({ limit: 50 })
			const botMsgs = msgs.filter(m => m.author.id === client.user!.id)

			for (const [, msg] of botMsgs) {
				let needsEdit = false

				// Traiter les embeds
				if (msg.embeds.length > 0) {
					const newEmbeds = msg.embeds.map((e) => {
						const json = e.toJSON() as any

						// Corriger le thumbnail
						if (json.thumbnail?.url?.includes(OLD_THUMB)) {
							json.thumbnail.url = NEW_THUMB
							needsEdit = true
						}

						// Corriger le titre
						if (json.title) {
							const fixed = applyCorrections(json.title)
							if (fixed !== json.title) {
								json.title = fixed
								needsEdit = true
							}
						}

						// Corriger la description
						if (json.description) {
							const fixed = applyCorrections(json.description)
							if (fixed !== json.description) {
								json.description = fixed
								needsEdit = true
							}
						}

						// Corriger les fields
						if (json.fields) {
							for (const field of json.fields) {
								if (field.name) {
									const fixedName = applyCorrections(field.name)
									if (fixedName !== field.name) {
										field.name = fixedName
										needsEdit = true
									}
								}
								if (field.value) {
									const fixedValue = applyCorrections(field.value)
									if (fixedValue !== field.value) {
										field.value = fixedValue
										needsEdit = true
									}
								}
							}
						}

						return json
					})

					if (needsEdit) {
						await msg.edit({ embeds: newEmbeds })
						totalEdited++
						console.log(`  ✅ #${textCh.name} — message corrigé`)
						await sleep(500)
					}
				}

				// Traiter le contenu texte (règlement)
				if (msg.content && msg.content.length > 0) {
					const fixedContent = applyCorrections(msg.content)
					if (fixedContent !== msg.content) {
						await msg.edit({ content: fixedContent })
						totalEdited++
						console.log(`  ✅ #${textCh.name} — texte corrigé`)
						await sleep(500)
					}
				}
			}
		} catch (err) {
			// Ignorer les erreurs de permission
		}
	}

	console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
	console.log(`✅ ${totalEdited} messages corrigés`)
	console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

	client.destroy()
	process.exit(0)
})

client.login(process.env.BOT_TOKEN)

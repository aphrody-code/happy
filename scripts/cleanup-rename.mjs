/**
 * Script de nettoyage et renommage : supprime les doublons et renomme
 * tous les salons/catégories avec des noms fidèles à l'univers Fairy Tail.
 *
 * Usage: node scripts/cleanup-rename.mjs [--dry-run]
 */
import 'dotenv/config'

const TOKEN = process.env.BOT_TOKEN
const GUILD_ID = process.env.TEST_GUILD_ID
const API = `https://discord.com/api/v10`
const headers = {
	'Authorization': `Bot ${TOKEN}`,
	'Content-Type': 'application/json',
}
const DRY_RUN = process.argv.includes('--dry-run')

async function apiCall(method, path, body) {
	if (DRY_RUN && method !== 'GET') {
		console.log(`  [DRY-RUN] ${method} ${path}${body ? ` → ${JSON.stringify(body)}` : ''}`)

		return {}
	}
	const res = await fetch(`${API}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	})
	if (!res.ok) {
		const text = await res.text()
		console.error(`  ❌ ${method} ${path} → ${res.status}: ${text}`)

		return null
	}
	const remaining = res.headers.get('x-ratelimit-remaining')
	if (remaining === '0') {
		const resetAfter = Number.parseFloat(res.headers.get('x-ratelimit-reset-after') || '1')
		console.log(`  ⏳ Rate limit, pause ${resetAfter.toFixed(1)}s...`)
		await new Promise(r => setTimeout(r, resetAfter * 1000 + 300))
	}
	if (res.status === 204) return {}

	return res.json()
}

// ══════════════════════════════════════════
// DOUBLONS À SUPPRIMER
// ══════════════════════════════════════════
const CHANNELS_TO_DELETE = [
	// VOCAUX : "General" est un doublon de "Salon General"
	{ id: '1477214175251009606', reason: 'doublon de Salon Général (voice)' },
	// RPG : doublons avec les nouveaux salons
	{ id: '1477217727629496401', reason: 'classement-rpg doublon de classement' },
	{ id: '1477217725376888864', reason: 'quetes-rpg doublon de tableau-des-quetes' },
	{ id: '1477217710722257070', reason: 'commandes-rpg redondant avec commandes-bot' },
	// HORS-SUJET : "jeux" doublon de "gaming"
	{ id: '1477117965865324545', reason: 'jeux doublon de gaming' },
	// HORS-SUJET : "films-et-series" fusionné dans "autres-animes" → renommé
	{ id: '1477117967950024866', reason: 'films-et-series fusionné dans autres-séries' },
	// GÉNÉRAL : "musique-bot" redondant avec commandes-bot
	{ id: '1477117924392042688', reason: 'musique-bot redondant' },
	// GÉNÉRAL : "(muted mic channel)" — leftover inutile
	{ id: '1477118266806767616', reason: 'muted mic channel leftover' },
	// CONSEIL DES MAGES : "conseil" doublon de "moderation"
	{ id: '1477117980725874698', reason: 'conseil doublon de moderation' },
	// CONSEIL DES MAGES : "rapports" similaire à "sanctions"
	{ id: '1477117983116759102', reason: 'rapports fusionné dans sanctions' },
	// ADMINISTRATION : "stats" doublon de "stats-bot"
	{ id: '1477117988854566983', reason: 'stats doublon de stats-bot' },
	// INFORMATIONS : "personnages" (vide) doublon de "presentations" (contient les 42 fiches)
	{ id: '1477273446416253081', reason: 'personnages vide, doublon de presentations' },
	// INFORMATIONS : "choisir-sa-guilde" (vide) doublon de "roles" (contient le menu)
	{ id: '1477273443757064212', reason: 'choisir-sa-guilde vide, doublon de roles' },
]

// ══════════════════════════════════════════
// RENOMMAGES — Fidélité à l'univers Fairy Tail
// ══════════════════════════════════════════

// Catégories
const CATEGORY_RENAMES = {
	'1477117857107279985': '📜 TABLEAU D\'AFFICHAGE', // INFORMATIONS →
	'1477273447540330577': '🍺 TAVERNE DE LA GUILDE', // GENERAL →
	// '🧚 FAIRY TAIL' — déjà parfait
	'1477117939978211399': '📖 ARCS & SAGAS', // ARCS & SAGAS → ajouter emoji
	'1477273462879027395': '⚔️ MISSIONS & QUÊTES', // RPG & JEUX →
	'1477273470508204194': '🌍 HORS DE FIORE', // HORS-SUJET →
	'1477273477336531060': '🔊 SALLES DE LA GUILDE', // VOCAUX →
	'1477273484743671878': '🎫 REQUÊTES', // TICKETS →
	// '⚖️ CONSEIL DES MAGES' — déjà canon FT
	'1477117984387371038': '👑 BUREAU DU MAÎTRE', // ADMINISTRATION →
}

// Salons texte et vocaux
const CHANNEL_RENAMES = {
	// ── TABLEAU D'AFFICHAGE ──
	'1477117909070516325': '📜・code-des-mages', // reglement →
	'1477121094803525703': '📢・avis-du-maître', // annonces →
	'1477117909988802565': '⚔️・choisir-sa-guilde', // roles → (garde la fonctionnalité mais renomme)
	'1477117912207593645': '📖・galerie-des-mages', // presentations →
	'1477217696222412912': '📰・actualités-de-fiore', // twitter-fairy-tail →

	// ── TAVERNE DE LA GUILDE ──
	'1477117910785720321': '🚪・porte-de-la-guilde', // bienvenue →
	'1477117915194069104': '🍺・comptoir', // discussion →
	'1477273451612868771': '✍️・marquage', // presentez-vous → (recevoir sa marque de guilde)
	'1477273452472963178': '🔮・lacrima-bot', // commandes-bot → (lacrima = cristal de communication FT)
	'1477117913222615180': '💡・boîte-à-requêtes', // suggestions →
	'1477273455895380005': '🐛・signalements', // bugs →

	// ── FAIRY TAIL ──
	'1477273457723965481': '📺・anime-manga', // anime-manga (ajouter emoji)
	'1477117931270836294': '🔮・prophéties', // theories →
	'1477117929719075010': '🎨・fan-art', // fan-art (ajouter emoji)
	'1477117917979087009': '📸・lacrima-vision', // medias → (la lacrima-vision = télé dans FT)
	'1477117935523987618': '⚠️・spoilers', // spoilers (ajouter emoji)
	'1477117918775873607': '😂・memes-de-la-guilde', // memes →
	'1477117920432750652': '🎭・cosplay', // cosplay (ajouter emoji)
	'1477117932235653272': '⚔️・combats-légendaires', // combats-favoris →
	'1477117933246484510': '🏆・panthéon-des-mages', // top-personnages →
	'1477117934521548881': '✨・magies-et-pouvoirs', // magies-et-pouvoirs (ajouter emoji)

	// ── MISSIONS & QUÊTES ──
	'1477273464657281177': '⚔️・tableau-des-missions', // aventure-rpg →
	'1477273466133676142': '🏪・marché-de-magnolia', // boutique →
	'1477273467501154364': '🏆・rang-des-mages', // classement →
	'1477117925335760916': '🎲・jeux-magiques', // mini-jeux →
	'1477117963889934527': '📋・quêtes-en-cours', // tableau-des-quetes →
	'1477217708662587496': '📜・règles-des-missions', // regles-rpg →
	'1477117959229931530': '🏅・classement-des-guildes', // classement-guildes →
	'1477117960748269619': '💬・parloir-des-guildes', // discussion-guildes →
	'1477117961977200652': '⚔️・inter-guildes', // inter-guildes (ajouter emoji)
	'1477217713230188634': '🏘️・magnolia', // magnolia (ajouter emoji)
	'1477217715742834770': '🏰・hall-de-fairy-tail', // guilde-fairy-tail →
	'1477217717944844421': '🚂・gare-de-magnolia', // gare-de-magnolia (ajouter emoji)
	'1477217720499175536': '🌳・parc-de-magnolia', // parc-magnolia →
	'1477217722658979993': '🏛️・crocus', // crocus (ajouter emoji)

	// ── HORS DE FIORE ──
	'1477117916825649314': '☕・détente', // hors-sujet →
	'1477117921120616550': '🎵・musique', // musique (ajouter emoji)
	'1477214174072410193': '🎮・arène-de-jeux', // gaming →
	'1477117966607974564': '📺・autres-séries', // autres-animes → (absorbe films-et-series)
	'1477273476619571230': '🔞・zone-interdite', // nsfw →

	// ── SALLES DE LA GUILDE (voix) ──
	'1477273479127498814': '🔊・Hall de la Guilde', // Salon General →
	'1477117971917836432': '🍺・Bar de la Guilde', // Bar de la Guilde (ajouter emoji)
	'1477273480553828393': '🏰・Salle du Conseil', // Salle de la Guilde →
	'1477117976011346001': '🎵・Salle de Lyra', // Musique → (Lyra = esprit musical de Lucy)
	'1477117974497464452': '📺・Lacrima-Vision', // Rewatch →
	'1477117977005658112': '🎮・Arène', // Jeux video →
	'1477117977957630135': '📚・Bibliothèque', // Muet -- Travail → (lieu calme)

	// ── CONSEIL DES MAGES ──
	'1477273486161608747': '💬・salle-du-conseil', // moderation →
	'1477117981812064361': '⚖️・jugements', // sanctions →
	'1477117986623062068': '📝・archives', // logs →

	// ── BUREAU DU MAÎTRE ──
	'1477117987944136877': '🔧・bureau', // admin →
	'1477273490536005693': '📊・lacrima-stats', // stats-bot →
	'1477117990209060914': '🧪・laboratoire', // test-bot →
}

// ══════════════════════════════════════════

async function main() {
	console.log(`${DRY_RUN ? '🧪 MODE DRY-RUN — ' : ''}🧹 Nettoyage et renommage du serveur Fairy Tail FR`)
	console.log('═'.repeat(55))

	// ── Phase 1 : Suppression des doublons ──
	console.log('\n📌 PHASE 1 : Suppression des doublons')
	console.log('─'.repeat(40))

	let deleted = 0
	for (const { id, reason } of CHANNELS_TO_DELETE) {
		const result = await apiCall('DELETE', `/channels/${id}`)
		if (result) {
			console.log(`  🗑️  ${reason}`)
			deleted++
		}
	}
	console.log(`\n  → ${deleted} salon(s) supprimé(s)`)

	// ── Phase 2 : Renommage des catégories ──
	console.log('\n📌 PHASE 2 : Renommage des catégories')
	console.log('─'.repeat(40))

	let renamedCats = 0
	for (const [id, newName] of Object.entries(CATEGORY_RENAMES)) {
		const result = await apiCall('PATCH', `/channels/${id}`, { name: newName })
		if (result) {
			console.log(`  📁 → ${newName}`)
			renamedCats++
		}
	}
	console.log(`\n  → ${renamedCats} catégorie(s) renommée(s)`)

	// ── Phase 3 : Renommage des salons ──
	console.log('\n📌 PHASE 3 : Renommage des salons')
	console.log('─'.repeat(40))

	let renamedChans = 0
	const entries = Object.entries(CHANNEL_RENAMES)
	for (let i = 0; i < entries.length; i++) {
		const [id, newName] = entries[i]
		const result = await apiCall('PATCH', `/channels/${id}`, { name: newName })
		if (result) {
			console.log(`  💬 → ${newName}`)
			renamedChans++
		}
		// Pause toutes les 8 requêtes pour le rate limit
		if ((i + 1) % 8 === 0 && i < entries.length - 1) {
			console.log('  ⏳ Pause anti rate-limit...')
			await new Promise(r => setTimeout(r, 3000))
		}
	}
	console.log(`\n  → ${renamedChans} salon(s) renommé(s)`)

	// ── Résumé final ──
	console.log(`\n${'═'.repeat(55)}`)

	if (!DRY_RUN) {
		const final = await apiCall('GET', `/guilds/${GUILD_ID}/channels`)
		const finalCats = final.filter(c => c.type === 4).sort((a, b) => a.position - b.position)

		console.log('\n📊 Structure finale :\n')
		let totalChannels = 0
		for (const cat of finalCats) {
			const children = final.filter(c => c.parent_id === cat.id).sort((a, b) => a.position - b.position)
			totalChannels += children.length
			console.log(`📁 ${cat.name} (${children.length})`)
			for (const ch of children) {
				const icon = ch.type === 2 ? '🔊' : '💬'
				console.log(`   ${icon} ${ch.name}`)
			}
		}
		console.log(`\n📊 Total : ${finalCats.length} catégories, ${totalChannels} salons`)
	}

	console.log('\n✅ Nettoyage et renommage terminés !')
}

main().catch(console.error)

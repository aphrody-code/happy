import { FAIRY_TAIL_SHOWS, Fancaps } from '../src/libs/fancaps'

async function main() {
	const fc = new Fancaps(300)
	console.log('Initialisation du navigateur...')
	await fc.init()

	try {
		console.log('\n── Shows Fairy Tail disponibles ──')
		for (const show of FAIRY_TAIL_SHOWS) {
			console.log(`  ${show.name} (ID: ${show.id}) → ${show.url}`)
		}

		console.log('\n── Récupération des épisodes (Fairy Tail 2009, page 1) ──')
		const episodes = await fc.getEpisodes(7261, 'Fairy_Tail')
		console.log(`  ${episodes.length} épisodes trouvés`)
		if (episodes.length > 0) {
			console.log(`  Premier: EP${episodes[0].episodeNumber} (ID: ${episodes[0].id})`)
			console.log(`  Dernier: EP${episodes[episodes.length - 1].episodeNumber} (ID: ${episodes[episodes.length - 1].id})`)

			// Tester les frames du premier épisode
			const ep = episodes[0]
			console.log(`\n── Frames de l'épisode ${ep.episodeNumber} (page 1) ──`)
			const { frames, hasNext } = await fc.getFrames(ep.id, ep.slug)
			console.log(`  ${frames.length} frames trouvées (page suivante: ${hasNext})`)
			if (frames.length > 0) {
				console.log(`  Première frame: ID ${frames[0].imageId}`)
				console.log(`    Thumbnail: ${frames[0].thumbnail}`)
				console.log(`    Full: ${frames[0].full}`)

				// Tester le téléchargement
				console.log('\n── Test téléchargement d\'une frame ──')
				const buf = await fc.downloadImage(frames[0].imageId)
				if (buf) {
					console.log(`  ✅ Image téléchargée: ${buf.length} octets`)
				} else {
					console.log('  ❌ Échec du téléchargement')
				}
			}
		}
	} catch (err) {
		console.error('Erreur:', err)
	} finally {
		await fc.close()
		console.log('\nNavigateur fermé.')
	}
}

main()

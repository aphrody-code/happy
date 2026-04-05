import fs from 'node:fs'
import path from 'node:path'

import { CheerioCrawler, Configuration } from 'crawlee'

const OUTPUT_DIR = path.resolve(process.cwd(), 'data')
const STORAGE_DIR = path.resolve(process.cwd(), '.storage')

Configuration.getGlobalConfig().set('storageClientOptions', { localDataDirectory: STORAGE_DIR })

async function scrapeEpisodes() {
	const episodes: any[] = []

	const crawler = new CheerioCrawler({
		async requestHandler({ $, request }) {
			console.log(`Processing ${request.url}...`)

			// On targeting tables that contain episode lists
			// They often have a header with "N°", "Titre", etc.
			$('table.wikitable').each((_, table) => {
				const rows = $(table).find('tr')
				rows.each((i, el) => {
					const cells = $(el).find('td')
					if (cells.length >= 2) {
						const numText = $(cells[0]).text().trim().split('\n')[0]
						const num = Number.parseInt(numText)

						if (!isNaN(num) && num > 0) {
							// Title is usually in the second cell
							let title = $(cells[1]).text().trim().replace(/^"|"$/g, '').split('\n')[0]
							// Remove any reference markers like [1]
							title = title.replace(/\[\d+\]/g, '').trim()

							if (!episodes.some(e => e.number === num)) {
								episodes.push({
									number: num,
									title,
								})
							}
						}
					}
				})
			})
		},
	})

	// The main list page
	await crawler.run(['https://fr.wikipedia.org/wiki/Liste_des_%C3%A9pisodes_de_Fairy_Tail'])

	episodes.sort((a, b) => a.number - b.number)
	console.log(`Scraped ${episodes.length} episodes from Wikipedia.`)

	// Load Anime-Sama data
	const animeSamaPath = path.join(OUTPUT_DIR, 'episodes.json')
	let animeSamaData = { eps1: [], eps2: [] }
	if (fs.existsSync(animeSamaPath)) {
		animeSamaData = JSON.parse(fs.readFileSync(animeSamaPath, 'utf-8'))
	}

	// Correlation
	const detailedEpisodes = episodes.map((ep) => {
		const index = ep.number - 1

		return {
			...ep,
			sources: {
				sibnet: animeSamaData.eps1[index] || null,
				vidmoly: animeSamaData.eps2[index] || null,
			},
			fancaps: getFancapsInfo(ep.number),
		}
	})

	fs.writeFileSync(path.join(OUTPUT_DIR, 'episodes-detailed.json'), JSON.stringify(detailedEpisodes, null, 2))
	console.log(`Saved ${detailedEpisodes.length} detailed episodes to data/episodes-detailed.json`)
}

function getFancapsInfo(num: number) {
	// 2009: 1-175 (Show 7261)
	if (num <= 175) {
		return { showId: 7261, name: 'Fairy Tail (2009)', episodeNumber: num, url: `https://fancaps.net/anime/episodeimages.php?7261-Fairy_Tail/Episode_${num}` }
	}
	// 2014: 176-277 (Show 1687)
	else if (num <= 277) {
		const relNum = num - 175

		return { showId: 1687, name: 'Fairy Tail (2014)', episodeNumber: relNum, url: `https://fancaps.net/anime/episodeimages.php?1687-Fairy_Tail_2014/Episode_${relNum}` }
	}
	// Final Series: 278-328 (Show 33538)
	else if (num <= 328) {
		const relNum = num - 277

		return { showId: 33538, name: 'Fairy Tail: Final Series', episodeNumber: relNum, url: `https://fancaps.net/anime/episodeimages.php?33538-Fairy_Tail__Final_Series/Episode_${relNum}` }
	}

	return null
}

scrapeEpisodes().catch(console.error)

import fs from 'node:fs'
import path from 'node:path'

const OUTPUT_DIR = path.resolve(process.cwd(), 'data')

async function buildMapping() {
	const animeSamaPath = path.join(OUTPUT_DIR, 'episodes.json')
	if (!fs.existsSync(animeSamaPath)) return
	const animeSamaData = JSON.parse(fs.readFileSync(animeSamaPath, 'utf-8'))

	const episodes: any[] = []

	// 1. Main Series (328 episodes)
	const ftMain = animeSamaData['fairy-tail']
	if (ftMain) {
		for (let i = 1; i <= 328; i++) {
			episodes.push({
				id: `ft-${i}`,
				number: i,
				title: `Épisode ${i}`,
				show: 'Fairy Tail',
				sources: {
					sibnet: ftMain.eps1[i - 1] || null,
					vidmoly: ftMain.eps2[i - 1] || null,
				},
				fancaps: getFancapsInfo(i),
			})
		}
	}

	// 2. 100 Years Quest (25 episodes)
	const ft100yq = animeSamaData['fairy-tail-100yq']
	if (ft100yq) {
		for (let i = 1; i <= 25; i++) {
			episodes.push({
				id: `100yq-${i}`,
				number: i,
				title: `100YQ Épisode ${i}`,
				show: 'Fairy Tail: 100 Years Quest',
				sources: {
					sendvid: ft100yq.eps1[i - 1] || null,
					vidmoly: ft100yq.eps2[i - 1] || null,
					oneupload: ft100yq.eps3 ? ft100yq.eps3[i - 1] : null,
				},
				fancaps: {
					showId: 42111,
					name: 'Fairy Tail: 100 Years Quest',
					episodeNumber: i,
					url: `https://fancaps.net/anime/episodeimages.php?42111-Fairy_Tail__100_Years_Quest/Episode_${i}`,
				},
			})
		}
	}

	fs.writeFileSync(path.join(OUTPUT_DIR, 'episodes-detailed.json'), JSON.stringify(episodes, null, 2))
	console.log(`Generated detailed mapping for ${episodes.length} episodes.`)
}

function getFancapsInfo(num: number) {
	if (num <= 175) {
		return { showId: 7261, name: 'Fairy Tail (2009)', episodeNumber: num, url: `https://fancaps.net/anime/episodeimages.php?7261-Fairy_Tail/Episode_${num}` }
	} else if (num <= 277) {
		const relNum = num - 175

		return { showId: 1687, name: 'Fairy Tail (2014)', episodeNumber: relNum, url: `https://fancaps.net/anime/episodeimages.php?1687-Fairy_Tail_2014/Episode_${relNum}` }
	} else if (num <= 328) {
		const relNum = num - 277

		return { showId: 33538, name: 'Fairy Tail: Final Series', episodeNumber: relNum, url: `https://fancaps.net/anime/episodeimages.php?33538-Fairy_Tail__Final_Series/Episode_${relNum}` }
	}

	return null
}

buildMapping()

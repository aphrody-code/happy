import axios from 'axios'

async function resolveSibnet(url: string) {
	console.log(`Resolving Sibnet: ${url}`)
	try {
		const response = await axios.get(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
				'Referer': 'https://anime-sama.tv/',
			},
		})

		const html = response.data

		// Find the player.src line specifically
		const lines = html.split('\n')
		const srcLine = lines.find((l: string) => l.includes('player.src'))
		console.log('Detected src line:', srcLine)

		const match = html.match(/player\.src\(\[\{src:\s*["']([^"']+)["'],\s*type:\s*["']video\/mp4["']\}\],?\s*\)\s*;/)

		if (match && match[1]) {
			const directUrl = `https://video.sibnet.ru${match[1]}`
			console.log(`✅ Direct MP4 found: ${directUrl}`)

			return directUrl
		} else {
			// Brute force search for any .mp4 relative path
			const simpleMatch = html.match(/\/v\/[^"']+\.mp4/)
			if (simpleMatch) {
				const directUrl = `https://video.sibnet.ru${simpleMatch[0]}`
				console.log(`✅ Direct MP4 found via simple match: ${directUrl}`)

				return directUrl
			}
			console.log('❌ Could not find direct source in HTML.')

			return null
		}
	} catch (error: any) {
		console.error(`❌ Error resolving Sibnet: ${error.message}`)

		return null
	}
}

resolveSibnet('https://video.sibnet.ru/shell.php?videoid=5063064')

import fs from 'node:fs'
import path from 'node:path'

import axios from 'axios'

async function resolvePlayers() {
	console.log('--- Testing Video Players (100YQ) ---')

	const filePath = path.join(process.cwd(), 'data', 'episodes.json')
	const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
	const ft100yq = data['fairy-tail-100yq']

	if (!ft100yq) {
		console.error('100YQ data not found.')

		return
	}

	const samples = [
		{ name: 'Sendvid', url: ft100yq.eps1[0] },
		{ name: 'Vidmoly', url: ft100yq.eps2[0] },
		{ name: 'OneUpload', url: ft100yq.eps3[0] },
	]

	for (const sample of samples) {
		console.log(`
Testing ${sample.name}: ${sample.url}`)
		try {
			const response = await axios.get(sample.url, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
					'Referer': 'https://anime-sama.tv/',
				},
				timeout: 10000,
			})

			console.log(`✅ Status: ${response.status}`)

			// Try to find video source in HTML
			const html = response.data
			const mp4Match = html.match(/https?:\/\/[^"']+\.mp4/i)
			const m3u8Match = html.match(/https?:\/\/[^"']+\.m3u8/i)

			if (mp4Match) console.log(`🔗 Potential MP4 found: ${mp4Match[0]}`)
			if (m3u8Match) console.log(`🔗 Potential M3U8 found: ${m3u8Match[0]}`)

			if (!mp4Match && !m3u8Match) {
				console.log('ℹ️ No direct video link found in HTML (likely obfuscated or in a script).')
			}
		} catch (error: any) {
			console.error(`❌ Failed: ${error.message}`)
		}
	}
}

resolvePlayers()

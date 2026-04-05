import axios from 'axios'

async function testVidmoly() {
	const url = 'https://vidmoly.to/embed-twrnh7yfq9ks.html'
	console.log(`Testing Vidmoly resolution: ${url}`)

	try {
		const response = await axios.get(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
				'Referer': 'https://anime-sama.tv/',
			},
		})

		console.log('--- CONTENT SNIPPET ---')
		// Look for script tags or sources
		const scripts = response.data.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)
		if (scripts) {
			console.log(`Found ${scripts.length} script tags.`)
			for (const script of scripts) {
				if (script.includes('file') || script.includes('m3u8') || script.includes('mp4')) {
					console.log('Potential video script found:')
					console.log(script.substring(0, 500))
				}
			}
		}

		const packed = response.data.match(/eval\(function\(p,a,c,k,e,d\).*\)/)
		if (packed) {
			console.log('Found packed (obfuscated) JS code!')
		}
	} catch (error: any) {
		console.error(error.message)
	}
}

testVidmoly()

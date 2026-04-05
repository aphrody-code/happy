import fs from 'node:fs'
import path from 'node:path'

import axios from 'axios'

async function testLinks() {
	const filePath = path.join(process.cwd(), 'data', 'episodes.json')
	if (!fs.existsSync(filePath)) {
		console.error('File not found: data/episodes.json')

		return
	}

	const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

	console.log(`Testing links from data/episodes.json...`)

	const sampleEps1 = data.eps1.slice(0, 5)
	const sampleEps2 = data.eps2.slice(0, 5)

	async function checkUrl(url: string) {
		try {
			const response = await axios.get(url, {
				timeout: 10000,
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				},
				validateStatus: () => true,
			})

			return { url, status: response.status, ok: response.status === 200 }
		} catch (err: any) {
			return { url, status: 'ERROR', ok: false, error: err.message }
		}
	}

	console.log('\n--- Testing Sibnet (eps1) - 5 samples ---')
	for (const url of sampleEps1) {
		const result = await checkUrl(url)
		console.log(`${result.ok ? '✅' : '❌'} [${result.status}] ${url}`)
	}

	console.log('\n--- Testing Vidmoly (eps2) - 5 samples ---')
	for (const url of sampleEps2) {
		const result = await checkUrl(url)
		console.log(`${result.ok ? '✅' : '❌'} [${result.status}] ${url}`)
	}
}

testLinks()

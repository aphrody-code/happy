import axios from 'axios'

async function scrapePage() {
	const url = 'https://anime-sama.tv/catalogue/fairy-tail/saison1/vf/'
	try {
		const response = await axios.get(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
				'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
				'Cache-Control': 'no-cache',
				'Pragma': 'no-cache',
				'Referer': 'https://anime-sama.tv/',
			},
		})

		console.log('--- HTML CONTENT START ---')
		console.log(response.data.substring(0, 5000)) // Print first 5000 chars to analyze
		console.log('--- HTML CONTENT END ---')
	} catch (error: any) {
		console.error('Error fetching page:', error.message)
		if (error.response) {
			console.error('Status:', error.response.status)
			console.error('Headers:', JSON.stringify(error.response.headers, null, 2))
		}
	}
}

scrapePage()

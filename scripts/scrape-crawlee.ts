import { PlaywrightCrawler } from 'crawlee'

async function scrapeAnimeSama() {
	const crawler = new PlaywrightCrawler({
		// Trying to bypass anti-bot
		headless: true,
		useSessionPool: true,
		persistCookiesPerSession: true,
		browserPoolOptions: {
			useFingerprints: true,
		},
		launchContext: {
			launchOptions: {
				args: [
					'--disable-blink-features=AutomationControlled',
					'--no-sandbox',
					'--disable-setuid-sandbox',
				],
			},
		},
		// We will ignore HTTP status codes so the crawler doesn't auto-retry on 403 and throws an error instead, giving us a chance to wait for Cloudflare challenge
		preNavigationHooks: [
			async ({ page }) => {
				await page.route('**/*', (route) => {
					const req = route.request()
					// Block unnecessary resources to speed up
					if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
						route.abort()
					} else {
						route.continue()
					}
				})
			},
		],
		async requestHandler({ request, page }) {
			console.log(`Processing: ${request.url}`)

			// Wait for cloudflare challenge to pass potentially
			await page.waitForTimeout(5000)

			console.log('Page Title:', await page.title())

			const episodesData = await page.evaluate(() => {
				const data: any = {}
				if (typeof (window as any).eps1 !== 'undefined') data.eps1 = (window as any).eps1
				if (typeof (window as any).eps2 !== 'undefined') data.eps2 = (window as any).eps2

				return data
			})

			console.log('Extracted Data Keys:', Object.keys(episodesData))

			if (episodesData.eps1) {
				console.log(`Found eps1 with ${episodesData.eps1.length} episodes.`)
				console.log('First 3:', episodesData.eps1.slice(0, 3))
			} else {
				const scripts = await page.locator('script').allTextContents()
				const epsScripts = scripts.filter(s => s.includes('var eps1'))
				if (epsScripts.length > 0) {
					console.log('Found script containing "var eps1". Length:', epsScripts[0].length)
				} else {
					console.log('Body:', (await page.locator('body').innerText()).substring(0, 300))
				}
			}
		},
	})

	await crawler.run(['https://anime-sama.tv/catalogue/fairy-tail/saison1/vf/'])
}

scrapeAnimeSama().catch(console.error)

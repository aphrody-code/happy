import * as cheerio from 'cheerio'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'

// ── Types ──

export interface FancapsShow {
	id: number
	slug: string
	name: string
	url: string
}

export interface FancapsEpisode {
	id: number
	slug: string
	episodeNumber: number
	url: string
}

export interface FancapsFrame {
	imageId: number
	thumbnail: string
	full: string
}

// ── Constantes ──

const BASE_URL = 'https://fancaps.net'

const CDN = {
	full: (id: number) => `https://cdni.fancaps.net/file/fancaps-animeimages/${id}.jpg`,
	fallback: (id: number) => `https://ancdn.fancaps.net/${id}.jpg`,
	thumbnail: (id: number) => `https://animethumbs.fancaps.net/${id}.jpg`,
}

export const FAIRY_TAIL_SHOWS: FancapsShow[] = [
	{
		id: 7261,
		slug: 'Fairy_Tail',
		name: 'Fairy Tail (2009)',
		url: `${BASE_URL}/anime/showimages.php?7261-Fairy_Tail=`,
	},
	{
		id: 1687,
		slug: 'Fairy_Tail_2014',
		name: 'Fairy Tail (2014)',
		url: `${BASE_URL}/anime/showimages.php?1687-Fairy_Tail_2014`,
	},
]

const CHROME_PATH = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable'

// ── Classe principale ──

export class Fancaps {

	private browser: Browser | null = null
	private page: Page | null = null
	private delay: number

	constructor(delay = 500) {
		this.delay = delay
	}

	// ── Lifecycle ──

	async init(): Promise<void> {
		if (this.browser) return

		this.browser = await puppeteer.launch({
			executablePath: CHROME_PATH,
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-gpu',
			],
		})
		this.page = await this.browser.newPage()
		await this.page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		)
	}

	async close(): Promise<void> {
		if (this.browser) {
			await this.browser.close()
			this.browser = null
			this.page = null
		}
	}

	private sleep(ms: number): Promise<void> {
		return new Promise(r => setTimeout(r, ms))
	}

	/**
	 * Navigue vers une URL, attend que Cloudflare passe, retourne le HTML.
	 */
	private async fetchPage(url: string): Promise<string> {
		if (!this.page) throw new Error('Appelle init() d\'abord.')

		await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })

		// Attendre que Cloudflare challenge se résolve (max 15s)
		let html = await this.page.content()
		let retries = 0
		while (html.includes('Just a moment') && retries < 30) {
			await this.sleep(500)
			html = await this.page.content()
			retries++
		}

		if (html.includes('Just a moment')) {
			throw new Error(`Cloudflare challenge non résolu pour ${url}`)
		}

		return html
	}

	// ── Episodes ──

	/**
	 * Liste tous les épisodes d'un show.
	 */
	async getEpisodes(showId: number, slug?: string): Promise<FancapsEpisode[]> {
		const showSlug = slug ?? FAIRY_TAIL_SHOWS.find(s => s.id === showId)?.slug ?? ''
		const episodes: FancapsEpisode[] = []
		let page = 1

		while (true) {
			const url = `${BASE_URL}/anime/showimages.php?${showId}-${showSlug}&page=${page}`
			const html = await this.fetchPage(url)
			const $ = cheerio.load(html)

			const links = $('a[href*="episodeimages.php"]')
			if (links.length === 0) break

			links.each((_, el) => {
				const href = $(el).attr('href')
				if (!href) return

				const match = href.match(/episodeimages\.php\?(\d+)-([^&]+)/)
				if (!match) return

				const epId = Number.parseInt(match[1], 10)
				const epSlug = match[2]
				const numMatch = epSlug.match(/Episode_(\d+)/)
				const epNum = numMatch ? Number.parseInt(numMatch[1], 10) : 0

				if (!episodes.some(e => e.id === epId)) {
					episodes.push({
						id: epId,
						slug: epSlug,
						episodeNumber: epNum,
						url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
					})
				}
			})

			const hasNext = $('a[title="Next Page"]').length > 0
				|| $('a:contains("Next")').filter((_, el) => $(el).attr('href')?.includes('page=') ?? false).length > 0

			if (!hasNext) break
			page++
			await this.sleep(this.delay)
		}

		return episodes.sort((a, b) => a.episodeNumber - b.episodeNumber)
	}

	// ── Frames ──

	/**
	 * Liste les frames d'un épisode (une page).
	 */
	async getFrames(episodeId: number, slug: string, page = 1): Promise<{ frames: FancapsFrame[], hasNext: boolean }> {
		const url = page === 1
			? `${BASE_URL}/anime/episodeimages.php?${episodeId}-${slug}`
			: `${BASE_URL}/anime/episodeimages.php?${episodeId}-${slug}&page=${page}`

		const html = await this.fetchPage(url)
		const $ = cheerio.load(html)
		const frames: FancapsFrame[] = []

		// Thumbnails
		$('img[src*="animethumbs.fancaps.net"]').each((_, el) => {
			const src = $(el).attr('src')
			if (!src) return
			const idMatch = src.match(/(\d+)\.jpg/)
			if (!idMatch) return

			const imageId = Number.parseInt(idMatch[1], 10)
			frames.push({
				imageId,
				thumbnail: CDN.thumbnail(imageId),
				full: CDN.full(imageId),
			})
		})

		// Fallback : liens picture.php
		if (frames.length === 0) {
			$('a[href*="picture.php"]').each((_, el) => {
				const href = $(el).attr('href') ?? ''
				const idMatch = href.match(/picture\.php\?\/(\d+)/)
				if (!idMatch) return
				const imageId = Number.parseInt(idMatch[1], 10)
				if (!frames.some(f => f.imageId === imageId)) {
					frames.push({
						imageId,
						thumbnail: CDN.thumbnail(imageId),
						full: CDN.full(imageId),
					})
				}
			})
		}

		const hasNext = $('a[title="Next Page"]').length > 0
			|| $('a:contains("Next")').filter((_, el) => $(el).attr('href')?.includes('page=') ?? false).length > 0

		return { frames, hasNext }
	}

	/**
	 * Récupère TOUTES les frames d'un épisode.
	 */
	async getAllFrames(episodeId: number, slug: string): Promise<FancapsFrame[]> {
		const all: FancapsFrame[] = []
		let page = 1

		while (true) {
			const { frames, hasNext } = await this.getFrames(episodeId, slug, page)
			all.push(...frames)
			if (!hasNext || frames.length === 0) break
			page++
			await this.sleep(this.delay)
		}

		return all
	}

	/**
	 * Frame aléatoire d'un épisode.
	 */
	async getRandomFrame(episodeId: number, slug: string): Promise<FancapsFrame | null> {
		const { frames, hasNext } = await this.getFrames(episodeId, slug, 1)
		if (frames.length === 0) return null

		if (!hasNext) {
			return frames[Math.floor(Math.random() * frames.length)]
		}

		const randomPage = Math.floor(Math.random() * 10) + 1
		const result = await this.getFrames(episodeId, slug, randomPage)
		const pool = result.frames.length > 0 ? result.frames : frames

		return pool[Math.floor(Math.random() * pool.length)]
	}

	// ── URLs statiques ──

	static imageUrl(imageId: number): string {
		return CDN.full(imageId)
	}

	static thumbnailUrl(imageId: number): string {
		return CDN.thumbnail(imageId)
	}

	static imageUrlFallback(imageId: number): string {
		return CDN.fallback(imageId)
	}

	// ── Helpers Fairy Tail ──

	async getFairyTailEpisodes(): Promise<FancapsEpisode[]> {
		return this.getEpisodes(7261, 'Fairy_Tail')
	}

	async getFairyTail2014Episodes(): Promise<FancapsEpisode[]> {
		return this.getEpisodes(1687, 'Fairy_Tail_2014')
	}

	/**
	 * Télécharge le buffer d'une image via le navigateur (contourne le CDN Cloudflare).
	 */
	async downloadImage(imageId: number): Promise<Buffer | null> {
		if (!this.page) throw new Error('Appelle init() d\'abord.')

		const url = CDN.full(imageId)
		try {
			const response = await this.page.goto(url, { waitUntil: 'load', timeout: 15_000 })
			if (!response || response.status() !== 200) return null

			return Buffer.from(await response.buffer())
		} catch {
			// Essayer le fallback
			try {
				const response = await this.page.goto(CDN.fallback(imageId), { waitUntil: 'load', timeout: 15_000 })
				if (!response || response.status() !== 200) return null

				return Buffer.from(await response.buffer())
			} catch {
				return null
			}
		}
	}
}

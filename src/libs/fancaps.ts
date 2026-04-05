import * as cheerio from 'cheerio'
import axios from 'axios'

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
	{
		id: 33538,
		slug: 'Fairy_Tail__Final_Series',
		name: 'Fairy Tail: Final Series',
		url: `${BASE_URL}/anime/showimages.php?33538-Fairy_Tail__Final_Series`,
	},
	{
		id: 42111,
		slug: 'Fairy_Tail__100_Years_Quest',
		name: 'Fairy Tail: 100 Years Quest',
		url: `${BASE_URL}/anime/showimages.php?42111-Fairy_Tail__100_Years_Quest`,
	},
]

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

// ── Classe principale (axios-only, pas de Puppeteer) ──

export class Fancaps {

	private delay: number

	constructor(delay = 500) {
		this.delay = delay
	}

	async init(): Promise<void> {
		// No-op: plus besoin de lancer un navigateur
	}

	async close(): Promise<void> {
		// No-op
	}

	private sleep(ms: number): Promise<void> {
		return new Promise(r => setTimeout(r, ms))
	}

	private async fetchPage(url: string): Promise<string | null> {
		try {
			const response = await axios.get(url, {
				headers: {
					'User-Agent': USER_AGENT,
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
				},
				timeout: 8000,
				validateStatus: (status) => status === 200,
			})

			if (response.data && response.data.length > 500) {
				return response.data
			}
		} catch {
			// Cloudflare 403 or timeout — fail gracefully
		}

		return null
	}

	// ── Episodes ──

	async getEpisodes(showId: number, slug?: string): Promise<FancapsEpisode[]> {
		const showSlug = slug ?? FAIRY_TAIL_SHOWS.find(s => s.id === showId)?.slug ?? ''
		const episodes: FancapsEpisode[] = []

		try {
			for (let page = 1; page <= 2; page++) {
				const url = `${BASE_URL}/anime/showimages.php?${showId}-${showSlug}&page=${page}`
				const html = await this.fetchPage(url)
				if (!html) break

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
				await this.sleep(this.delay)
			}
		} catch (e) {
			console.error('[Fancaps] getEpisodes Error:', (e as Error).message)
		}

		return episodes.sort((a, b) => a.episodeNumber - b.episodeNumber)
	}

	// ── Frames ──

	async getFrames(episodeId: number, slug: string, page = 1): Promise<{ frames: FancapsFrame[], hasNext: boolean }> {
		const url = page === 1
			? `${BASE_URL}/anime/episodeimages.php?${episodeId}-${slug}`
			: `${BASE_URL}/anime/episodeimages.php?${episodeId}-${slug}&page=${page}`

		try {
			const html = await this.fetchPage(url)
			if (!html) return { frames: [], hasNext: false }

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
		} catch (e) {
			console.error('[Fancaps] getFrames Error:', (e as Error).message)
			return { frames: [], hasNext: false }
		}
	}

	async getRandomFrame(episodeId: number, slug: string): Promise<FancapsFrame | null> {
		const { frames, hasNext } = await this.getFrames(episodeId, slug, 1)
		if (frames.length === 0) return null

		if (!hasNext) {
			return frames[Math.floor(Math.random() * frames.length)]
		}

		const randomPage = Math.floor(Math.random() * 5) + 1
		const result = await this.getFrames(episodeId, slug, randomPage)
		const pool = result.frames.length > 0 ? result.frames : frames

		return pool[Math.floor(Math.random() * pool.length)]
	}

	static imageUrl(imageId: number): string {
		return CDN.full(imageId)
	}

	static thumbnailUrl(imageId: number): string {
		return CDN.thumbnail(imageId)
	}

	static imageUrlFallback(imageId: number): string {
		return CDN.fallback(imageId)
	}
}

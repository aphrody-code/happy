import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import axios from 'axios'

import { Service } from '@/decorators'

export type EpisodeDetailed = {
	id: string
	number: number
	title: string
	title_ja?: string | null
	thumbnail?: string | null
	show: string
	sources: {
		[key: string]: string | null
	}
	fancaps?: {
		showId: number
		name: string
		episodeNumber: number
		url: string
	} | null
}

type EpisodeMp4 = {
	id: string
	show: string
	number: number
	title: string
	title_ja?: string | null
	thumbnail?: string | null
	mp4: string | null
	fallback: string | null
}

@Service()
export class AnimeService {

	private detailedData: EpisodeDetailed[] = []
	private mp4Index: Map<string, EpisodeMp4> = new Map()
	private linkCache: Map<string, string> = new Map()
	private isLoaded = false

	constructor() {
		this.loadData()
	}

	private loadData() {
		if (this.isLoaded) return
		try {
			// Load pre-resolved MP4 links (fast path)
			const mp4Path = path.join(process.cwd(), 'data', 'episodes-mp4.json')
			if (fs.existsSync(mp4Path)) {
				const mp4Data: EpisodeMp4[] = JSON.parse(fs.readFileSync(mp4Path, 'utf-8'))
				for (const ep of mp4Data) {
					this.mp4Index.set(ep.id, ep)
				}
			}

			// Load detailed data (for fancaps, alt sources)
			const detailedPath = path.join(process.cwd(), 'data', 'episodes-detailed.json')
			if (fs.existsSync(detailedPath)) {
				this.detailedData = JSON.parse(fs.readFileSync(detailedPath, 'utf-8'))
			}

			this.isLoaded = true
		} catch (error) {
			console.error('Failed to load episode data:', error)
		}
	}

	public getEpisode(showPrefix: 'ft' | '100yq', episodeNumber: number): EpisodeDetailed | null {
		this.loadData()
		return this.detailedData.find(ep => ep.id === `${showPrefix}-${episodeNumber}`) || null
	}

	/**
	 * Get direct MP4 link if available (instant, no network call)
	 */
	public getDirectMp4(showPrefix: 'ft' | '100yq', episodeNumber: number): string | null {
		this.loadData()
		const ep = this.mp4Index.get(`${showPrefix}-${episodeNumber}`)
		return ep?.mp4 || ep?.fallback || null
	}

	public getTotalEpisodes(showPrefix: 'ft' | '100yq'): number {
		this.loadData()
		// Use mp4Index if available (larger dataset), else detailed
		let count = 0
		for (const key of this.mp4Index.keys()) {
			if (key.startsWith(`${showPrefix}-`)) count++
		}
		if (count > 0) return count

		for (const ep of this.detailedData) {
			if (ep.id.startsWith(`${showPrefix}-`)) count++
		}
		return count
	}

	public async resolveDirectLink(url: string): Promise<string | null> {
		if (this.linkCache.has(url)) {
			return this.linkCache.get(url)!
		}

		let directLink: string | null = null

		if (url.includes('sibnet.ru')) {
			try {
				const response = await axios.get(url, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
						'Referer': 'https://anime-sama.tv/',
					},
					timeout: 4000,
				})
				const match = response.data.match(/\/v\/[^"']+\.mp4/)
				if (match) directLink = `https://video.sibnet.ru${match[0]}`
			} catch {
				// Fallback gracefully
			}
		} else if (url.includes('sendvid.com')) {
			try {
				const response = await axios.get(url, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
					},
					timeout: 4000,
				})
				const match = response.data.match(/https?:\/\/[^"']+\.mp4/i)
				if (match) directLink = match[0]
			} catch {
				// Fallback gracefully
			}
		}

		if (directLink) {
			this.linkCache.set(url, directLink)
			return directLink
		}

		return null
	}

}

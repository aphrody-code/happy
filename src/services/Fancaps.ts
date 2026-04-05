import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { Service } from '@/decorators'

export type EpisodeThumbnail = {
	number: number
	title_en: string | null
	title_ja: string | null
	thumbnail: string | null
}

export type ThumbnailIndex = Record<string, EpisodeThumbnail>

const SHOWS = [
	{ id: 'ft', name: 'Fairy Tail (2009)', prefix: 'ft', range: [1, 175] },
	{ id: 'ft2014', name: 'Fairy Tail (2014)', prefix: 'ft', range: [176, 277] },
	{ id: 'ftFinal', name: 'Fairy Tail: Final Series', prefix: 'ft', range: [278, 328] },
	{ id: '100yq', name: 'Fairy Tail: 100 Years Quest', prefix: '100yq', range: [1, 26] },
] as const

@Service()
export class FancapsService {

	private thumbnails: ThumbnailIndex = {}
	private loaded = false

	private loadData() {
		if (this.loaded) return
		try {
			const filePath = path.join(process.cwd(), 'data', 'episode-thumbnails.json')
			if (fs.existsSync(filePath)) {
				this.thumbnails = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
			}
			this.loaded = true
		} catch (error) {
			console.error('[FancapsService] Failed to load thumbnails:', error)
		}
	}

	/**
	 * Get a random episode thumbnail for a given show range
	 */
	getRandomThumbnail(showPrefix: 'ft' | '100yq', episodeNumber?: number): { thumbnail: string, title_en: string | null, title_ja: string | null, number: number } | null {
		this.loadData()

		if (episodeNumber) {
			const key = `${showPrefix}-${episodeNumber}`
			const ep = this.thumbnails[key]
			if (!ep?.thumbnail) return null
			return { thumbnail: ep.thumbnail, title_en: ep.title_en, title_ja: ep.title_ja, number: ep.number }
		}

		// Random episode with a thumbnail from the prefix
		const keys = Object.keys(this.thumbnails).filter(k => k.startsWith(`${showPrefix}-`) && this.thumbnails[k].thumbnail)
		if (keys.length === 0) return null

		const randomKey = keys[Math.floor(Math.random() * keys.length)]
		const ep = this.thumbnails[randomKey]
		return { thumbnail: ep.thumbnail!, title_en: ep.title_en, title_ja: ep.title_ja, number: ep.number }
	}

	/**
	 * Get total thumbnail count for a show prefix
	 */
	getThumbnailCount(showPrefix: 'ft' | '100yq'): number {
		this.loadData()
		return Object.keys(this.thumbnails).filter(k => k.startsWith(`${showPrefix}-`)).length
	}

	getShows() {
		return SHOWS
	}

}

import 'reflect-metadata'

import { FancapsService } from '../src/services/Fancaps'

async function test() {
	console.log('--- Testing FancapsService ---')
	const service = new FancapsService()

	console.log('Attempting to get a random frame from Fairy Tail (2009)...')
	try {
		const start = Date.now()
		// Test with a specific episode to be faster
		const result = await service.getRandomFrameFromShow(7261, 1)
		const end = Date.now()

		if (result) {
			console.log('✅ Success!')
			console.log(`Episode: ${result.episode.episodeNumber} (${result.episode.slug})`)
			console.log(`Frame URL: ${result.frame.full}`)
			console.log(`Time taken: ${(end - start) / 1000}s`)
		} else {
			console.log('❌ Failed to get frame.')
		}
	} catch (error: any) {
		console.error('❌ Error during test:', error.message)
	} finally {
		await service.cleanup()
		console.log('--- Test Finished ---')
	}
}

test()

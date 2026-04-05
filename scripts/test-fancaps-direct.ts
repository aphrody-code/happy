import { Fancaps } from '../src/libs/fancaps'

async function test() {
	console.log('--- Testing Fancaps (Direct) ---')
	const fancaps = new Fancaps()

	console.log('Attempting to get a random frame from Fairy Tail (2009) Episode 1...')
	try {
		await fancaps.init()
		const start = Date.now()

		// Show 7261 is Fairy Tail (2009)
		// Episode 1 slug is Episode_1
		const frame = await fancaps.getRandomFrame(7261, 'Episode_1')
		const end = Date.now()

		if (frame) {
			console.log('✅ Success!')
			console.log(`Frame ID: ${frame.imageId}`)
			console.log(`Frame URL: ${frame.full}`)
			console.log(`Time taken: ${(end - start) / 1000}s`)
		} else {
			console.log('❌ Failed to get frame.')
		}
	} catch (error: any) {
		console.error('❌ Error during test:', error.message)
	} finally {
		await fancaps.close()
		console.log('--- Test Finished ---')
	}
}

test()

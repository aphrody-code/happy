import { writeFile } from 'node:fs/promises'

import { generateProfileCard, generateWelcomeCard } from '../src/libs/card'

async function main() {
	console.log('Génération de la welcome card...')
	const welcome = await generateWelcomeCard({
		username: 'Natsu Dragneel',
		avatarUrl: 'https://i.pinimg.com/originals/a1/bd/f1/a1bdf1d65acd999c00c627b11998cd3b.gif',
		memberCount: 42,
	})
	await writeFile('test-welcome-card.png', welcome)
	console.log(`✅ Welcome card: ${welcome.length} octets → test-welcome-card.png`)

	console.log('Génération de la profile card...')
	const profile = await generateProfileCard({
		username: 'Natsu Dragneel',
		avatarUrl: 'https://i.pinimg.com/originals/a1/bd/f1/a1bdf1d65acd999c00c627b11998cd3b.gif',
		level: 15,
		xp: 2350,
		xpNeeded: 5000,
		jewels: 12500,
		hp: 340,
		maxHp: 400,
		mp: 180,
		maxMp: 250,
		location: 'Magnolia',
		guild: 'Fairy Tail',
	})
	await writeFile('test-profile-card.png', profile)
	console.log(`✅ Profile card: ${profile.length} octets → test-profile-card.png`)
}

main().catch(console.error)

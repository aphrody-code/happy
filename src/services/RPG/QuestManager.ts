import { Service } from '@/decorators'

export type Quest = {
	id: string
	name: string
	description: string
	reward: { jewels: number, xp: number, items?: string[] }
	steps: number
	type: 'exploration' | 'combat' | 'dialogue'
}

@Service()
export class QuestManager {

	private quests: Map<string, Quest> = new Map()

	constructor() {
		this.initQuests()
	}

	private initQuests() {
		const quests: Quest[] = [
			{
				id: 'intro_magnolia',
				name: 'Bienvenue à Magnolia',
				description: 'Explorez la ville de Magnolia pour vous familiariser avec les lieux.',
				reward: { jewels: 50, xp: 20 },
				steps: 3,
				type: 'exploration',
			},
			{
				id: 'peche_happy',
				name: 'Un poisson pour Happy',
				description: 'Allez au parc de Magnolia et trouvez un poisson frais pour Happy.',
				reward: { jewels: 20, xp: 10, items: ['badge_ami_happy'] },
				steps: 2,
				type: 'exploration',
			},
			{
				id: 'premier_combat',
				name: 'Entraînement musclé',
				description: 'Affrontez Natsu dans la guilde de Fairy Tail pour tester vos capacités.',
				reward: { jewels: 100, xp: 50 },
				steps: 1,
				type: 'combat',
			},
		]

		for (const quest of quests) {
			this.quests.set(quest.id, quest)
		}
	}

	getQuest(id: string): Quest | undefined {
		return this.quests.get(id)
	}

}

import { Service } from '@/decorators'

export type DialogueNode = {
	id: string
	text: string
	options: { text: string, nextNode: string, action?: string }[]
	conditions?: (flags: Map<string, any>) => boolean
}

@Service()
export class NarrativeEngine {

	private dialogues: Map<string, DialogueNode[]> = new Map()

	constructor() {
		this.initDialogues()
	}

	private initDialogues() {
		// Example: Natsu's dialogue
		this.dialogues.set('natsu', [
			{
				id: 'start',
				text: 'Yo ! Prêt pour une mission ou t\'es juste venu manger ?',
				options: [
					{ text: 'Je suis prêt pour une mission !', nextNode: 'mission_ready' },
					{ text: 'J\'ai faim...', nextNode: 'hungry' },
				],
			},
			{
				id: 'mission_ready',
				text: 'C\'est ça l\'esprit de Fairy Tail ! On y va !',
				options: [
					{ text: 'Finir la discussion', nextNode: 'end', action: 'start_quest:intro_magnolia' },
				],
			},
			{
				id: 'hungry',
				text: 'Va voir Mira, elle a sûrement un truc à te donner.',
				options: [
					{ text: 'Aller voir Mira', nextNode: 'end' },
				],
			},
		])
	}

	getDialogue(npcId: string, nodeId: string): DialogueNode | undefined {
		const npcDialogues = this.dialogues.get(npcId)

		return npcDialogues?.find(node => node.id === nodeId)
	}

}

import { Service } from '@/decorators'

export type Room = {
	id: string
	name: string
	description: string
	connections: string[]
	items?: string[]
	npcs?: string[]
}

@Service()
export class WorldManager {

	private rooms: Map<string, Room> = new Map()

	constructor() {
		this.initRooms()
	}

	private initRooms() {
		const rooms: Room[] = [
			{
				id: 'magnolia',
				name: 'Magnolia',
				description: 'Une ville paisible connue pour abriter la guilde Fairy Tail.',
				connections: ['guilde_ft', 'gare_magnolia', 'parc_magnolia'],
			},
			{
				id: 'guilde_ft',
				name: 'Guilde Fairy Tail',
				description: 'Le bâtiment emblématique de Fairy Tail. On y entend déjà les bruits de bagarre.',
				connections: ['magnolia', 'infirmerie_ft'],
				npcs: ['natsu', 'lucy', 'mirajane', 'makarof'],
			},
			{
				id: 'gare_magnolia',
				name: 'Gare de Magnolia',
				description: 'Le point de départ pour de nombreuses missions à travers Fiore.',
				connections: ['magnolia', 'crocus', 'onibus'],
			},
			{
				id: 'crocus',
				name: 'Crocus',
				description: 'La capitale fleurie de Fiore, où se déroulent les Grands Jeux Inter-Magiques.',
				connections: ['gare_magnolia', 'domus_au'],
			},
			{
				id: 'parc_magnolia',
				name: 'Parc de Magnolia',
				description: 'Un grand parc verdoyant au centre de la ville.',
				connections: ['magnolia'],
				items: ['poisson_frais'],
			},
		]

		for (const room of rooms) {
			this.rooms.set(room.id, room)
		}
	}

	getRoom(id: string): Room | undefined {
		return this.rooms.get(id)
	}

	getAllRooms(): Room[] {
		return Array.from(this.rooms.values())
	}

}

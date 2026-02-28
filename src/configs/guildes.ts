export interface FairyTailGuildeConfig {
	id: string
	name: string
	emoji: string
	color: string
	description: string
	type: 'legale' | 'noire' | 'independante'
}

export const fairyTailGuildes: FairyTailGuildeConfig[] = [

	// ========== Guildes Légales ==========
	{ id: 'fairy-tail', name: 'Fairy Tail', emoji: '🧚', color: '#E8672A', description: 'La guilde la plus turbulente de Fiore', type: 'legale' },
	{ id: 'blue-pegasus', name: 'Blue Pegasus', emoji: '🦄', color: '#5B8DEF', description: 'La guilde des Trimens élégants', type: 'legale' },
	{ id: 'lamia-scale', name: 'Lamia Scale', emoji: '🐍', color: '#2ECC71', description: 'La guilde du Nord dirigée par Baba', type: 'legale' },
	{ id: 'saber-tooth', name: 'Saber Tooth', emoji: '🐯', color: '#F1C40F', description: 'La guilde la plus puissante de Fiore', type: 'legale' },
	{ id: 'mermaid-heel', name: 'Mermaid Heel', emoji: '🧜', color: '#E91E63', description: 'La guilde exclusivement féminine', type: 'legale' },
	{ id: 'quattro-cerberos', name: 'Quattro Cerberos', emoji: '🐕', color: '#8B4513', description: 'La guilde sauvage et déchaînée', type: 'legale' },
	{ id: 'twilight-ogre', name: 'Twilight Ogre', emoji: '👹', color: '#9B59B6', description: 'La guilde qui a dominé Magnolia', type: 'legale' },
	{ id: 'carbuncle', name: 'Carbuncle', emoji: '💎', color: '#E74C3C', description: 'Une guilde de chasseurs de trésors', type: 'legale' },
	{ id: 'diabolos', name: 'Diabolos', emoji: '😈', color: '#C0392B', description: 'La guilde des Dragon Eaters', type: 'legale' },
	{ id: 'dullahan-head', name: 'Dullahan Head', emoji: '💀', color: '#7F8C8D', description: 'Une guilde mystérieuse et sombre', type: 'legale' },
	{ id: 'dwarf-gear', name: 'Dwarf Gear', emoji: '⚙️', color: '#95A5A6', description: 'La guilde des artisans et mécaniciens', type: 'legale' },
	{ id: 'fairy-nail', name: 'Fairy Nail', emoji: '💅', color: '#FF69B4', description: 'Une guilde au nom similaire à Fairy Tail', type: 'legale' },
	{ id: 'fairy-tail-edolas', name: 'Fairy Tail (Edolas)', emoji: '✨', color: '#E67E22', description: 'La guilde Fairy Tail du monde d\'Edolas', type: 'legale' },
	{ id: 'gold-owl', name: 'Gold Owl', emoji: '🦉', color: '#DAA520', description: 'La guilde du hibou doré', type: 'legale' },
	{ id: 'gramlush', name: 'Gramlush', emoji: '🌿', color: '#27AE60', description: 'Une guilde légale de Fiore', type: 'legale' },
	{ id: 'hound-holy', name: 'Hound Holy', emoji: '🐺', color: '#3498DB', description: 'La guilde du chien sacré', type: 'legale' },
	{ id: 'magia-dragon', name: 'Magia Dragon', emoji: '🐉', color: '#E74C3C', description: 'La guilde fondée par les Dragon Slayers', type: 'legale' },
	{ id: 'loup-du-sud', name: 'Mercenaires du Loup du Sud', emoji: '🐺', color: '#607D8B', description: 'Les mercenaires du sud de Fiore', type: 'legale' },
	{ id: 'orochis-fin', name: "Orochi's Fin", emoji: '🐲', color: '#1ABC9C', description: 'La guilde du serpent Orochi', type: 'legale' },
	{ id: 'phoenix-grave', name: 'Phoenix Grave', emoji: '🔥', color: '#FF4500', description: 'La guilde du phénix', type: 'legale' },
	{ id: 'red-princess', name: 'Red Princess', emoji: '👸', color: '#DC143C', description: 'La guilde de la princesse rouge', type: 'legale' },
	{ id: 'scarmiglione', name: 'Scarmiglione', emoji: '🎭', color: '#4A235A', description: 'Une guilde au caractère théâtral', type: 'legale' },
	{ id: 'titan-nose', name: 'Titan Nose', emoji: '👃', color: '#BDC3C7', description: 'La guilde au nez de titan', type: 'legale' },
	{ id: 'love-lucky', name: 'Love & Lucky', emoji: '💕', color: '#FF1493', description: 'La guilde marchande de Layla Heartfilia', type: 'legale' },

	// ========== Guildes Noires (Illégales) ==========
	{ id: 'grimoire-heart', name: 'Grimoire Heart', emoji: '📖', color: '#8B0000', description: 'L\'une des trois grandes guildes noires', type: 'noire' },
	{ id: 'tartaros', name: 'Tartaros', emoji: '👿', color: '#4A0E0E', description: 'La guilde des démons de Zeleph', type: 'noire' },
	{ id: 'abyss-horn', name: 'Abyss Horn', emoji: '📯', color: '#2C3E50', description: 'Une guilde noire des abysses', type: 'noire' },
	{ id: 'blue-skull', name: 'Blue Skull', emoji: '☠️', color: '#1A5276', description: 'La guilde noire qui terrorisait Magnolia', type: 'noire' },
	{ id: 'chrono-noise', name: 'Chrono Noise', emoji: '⏰', color: '#6C3483', description: 'Une guilde noire manipulatrice du temps', type: 'noire' },
	{ id: 'assassins-skulls', name: 'Assassins des Skulls', emoji: '🗡️', color: '#1C1C1C', description: 'La guilde d\'assassins impitoyables', type: 'noire' },
	{ id: 'dark-mirror', name: 'Dark Mirror', emoji: '🪞', color: '#34495E', description: 'La guilde du miroir obscur', type: 'noire' },
	{ id: 'fire-flame', name: 'Fire & Flame', emoji: '🔥', color: '#D35400', description: 'La guilde noire du feu', type: 'noire' },
	{ id: 'five-bridge-familia', name: 'Five Bridge Familia', emoji: '🌉', color: '#784212', description: 'Une guilde noire organisée en famille', type: 'noire' },
	{ id: 'ghoul-spirits', name: 'Ghoul Spirits', emoji: '👻', color: '#515A5A', description: 'La guilde des esprits morts-vivants', type: 'noire' },
	{ id: 'naked-mummy', name: 'Naked Mummy', emoji: '🩹', color: '#A04000', description: 'Une guilde noire de bandits', type: 'noire' },
	{ id: 'raven-goblin', name: 'Raven Goblin', emoji: '🐦‍⬛', color: '#1B2631', description: 'La guilde noire du corbeau', type: 'noire' },
	{ id: 'succubus-eye', name: 'Succubus Eye', emoji: '👁️', color: '#8E44AD', description: 'La guilde noire affiliée à Tartaros', type: 'noire' },

	// ========== Guilde Indépendante ==========
	{ id: 'crime-sorciere', name: 'Crime Sorcière', emoji: '⚖️', color: '#2980B9', description: 'La guilde indépendante de Gerald Fernandez', type: 'independante' },
]

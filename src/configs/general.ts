import { env } from '@/env'

export const generalConfig: GeneralConfigType = {

	name: 'Fairy Tail FR', // le nom du bot
	description: 'Aye ! Je suis Happy, le chat ailé de Fairy Tail !', // la description du bot
	defaultLocale: 'fr', // langue par défaut du bot, doit être une locale valide
	ownerId: env.BOT_OWNER_ID,
	timezone: 'Europe/Paris', // fuseau horaire par défaut pour le formatage des dates (logs, stats, etc)

	simpleCommandsPrefix: '!', // préfixe par défaut pour les commandes simples (ancien système de commandes Discord)
	automaticDeferring: true, // activer ou non le defer automatique des réponses du bot sur les interactions

	// liens utiles
	links: {
		invite: `https://discord.com/oauth2/authorize?client_id=1477087076032970844&permissions=2415921152&scope=bot%20applications.commands`,
		supportServer: 'https://discord.gg/fairytailfr',
		gitRemoteRepo: 'https://github.com/barthofu/tscord',
	},

	automaticUploadImagesToImgur: false, // activer ou non l'upload automatique des images

	devs: [], // IDs Discord des développeurs travaillant sur le bot (pas besoin de mettre l'ID du propriétaire ici)

	// définir les activités du bot (phrases sous son nom). Types possibles : PLAYING, LISTENING, WATCHING, STREAMING
	activities: [
		{
			text: 'Aye !',
			type: 'CUSTOM',
		},
		{
			text: 'du poisson',
			type: 'WATCHING',
		},
		{
			text: 'voler avec Natsu',
			type: 'PLAYING',
		},
		{
			text: 'les secrets de Lucy',
			type: 'LISTENING',
		},
		{
			text: 'C\'est beau l\'amouurr !',
			type: 'CUSTOM',
		},
		{
			text: 'la guilde Fairy Tail',
			type: 'WATCHING',
		},
	],

}

// couleurs globales
export const colorsConfig = {

	primary: '#2F3136',
	guildeDefault: '#E8672A',
	happy: '#3B82F6',
}

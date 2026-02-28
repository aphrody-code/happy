import { env } from '@/env'

export const generalConfig: GeneralConfigType = {

	name: 'Fairy Tail FR', // le nom du bot
	description: 'Bot officiel de la communauté Fairy Tail française', // la description du bot
	defaultLocale: 'fr', // langue par défaut du bot, doit être une locale valide
	ownerId: env.BOT_OWNER_ID,
	timezone: 'Europe/Paris', // fuseau horaire par défaut pour le formatage des dates (logs, stats, etc)

	simpleCommandsPrefix: '!', // préfixe par défaut pour les commandes simples (ancien système de commandes Discord)
	automaticDeferring: true, // activer ou non le defer automatique des réponses du bot sur les interactions

	// liens utiles
	links: {
		invite: `https://discord.com/oauth2/authorize?client_id=1477087076032970844&permissions=8&scope=bot%20applications.commands`,
		supportServer: 'https://discord.gg/fairytailfr',
		gitRemoteRepo: 'https://github.com/barthofu/tscord',
	},

	automaticUploadImagesToImgur: false, // activer ou non l'upload automatique des images

	devs: [], // IDs Discord des développeurs travaillant sur le bot (pas besoin de mettre l'ID du propriétaire ici)

	// définir les activités du bot (phrases sous son nom). Types possibles : PLAYING, LISTENING, WATCHING, STREAMING
	activities: [
		{
			text: 'Fairy Tail FR ✨',
			type: 'WATCHING',
		},
		{
			text: 'la guilde Fairy Tail',
			type: 'LISTENING',
		},
	],

}

// couleurs globales
export const colorsConfig = {

	primary: '#2F3136',
	guildeDefault: '#E8672A',
}

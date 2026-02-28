import 'dotenv/config'

import { Client, GatewayIntentBits } from 'discord.js'

const userId = '281114294152724491'
const token = process.env.BOT_TOKEN

if (!token) {
	console.error('Missing BOT_TOKEN in .env')
	process.exit(1)
}

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
})

const welcomeMessage = `# 🧚 **BIENVENUE À LA GUILDE FAIRY TAIL FR !** 🧚

**Aye Sir !** C'est moi, **Happy**, l'Exceed bleu de la guilde ! Je suis trop content de te voir ici. Laisse-moi te faire visiter notre foyer avant que Natsu ne mette le feu à tout le serveur ! 🔥

---

### 🗺️ **C'est quoi ce serveur ?**
C'est le repaire de tous les mages de Fiore ! Ici, on discute de l'univers de Hiro Mashima, on partage nos théories, nos dessins, et on s'amuse ensemble. Mais attention, ce n'est pas qu'un simple lieu de discussion... c'est une **véritable aventure interactive !**

---

### ⚔️ **Le Système RPG & Progression**
Sur ce serveur, tu n'es pas qu'un simple membre, tu es un **mage** ! 
- **Gagne de l'XP :** En discutant et en participant, tu montes de niveau.
- **Équipe-toi :** Tu peux débloquer des objets et des sorts uniques.
- **Deviens Mage de Rang S :** Seuls les plus fidèles et les plus braves pourront prétendre à ce titre !

---

### 🏛️ **Choisis ta Guilde (Affiliation)**
Grâce à moi, tu peux rejoindre ta guilde préférée ! Utilise mes commandes pour prêter serment :
- **Fairy Tail** (bien sûr ! 🧚)
- **Saber Tooth** 🐅, **Lamia Scale** 🐍, **Blue Pegasus** 🐴...
- Et même des guildes clandestines comme **Grimoire Heart** ou **Tartaros** pour les plus sombres d'entre vous !
*Chaque guilde a ses propres salons secrets et son propre rôle coloré !*

---

### 📜 **Le Règlement (La colère d'Erza)**
On est une famille, mais on a des règles ! 
1. **Respecte tes Nakamas :** Pas d'insultes, on s'aime tous (c'est beau l'amouuur ! ❤️).
2. **Pas de Spam :** Sinon Erza va sortir son armure du Purgatoire...
3. **Spoiler :** Utilise les balises prévues pour ne pas gâcher la surprise des autres.

---

### 🖥️ **Le Dashboard de la Guilde**
Pour les mages les plus curieux, nous avons un **tableau de bord magique** ! Tu peux y voir tes statistiques, le classement des mages et gérer ton profil de guilde. 

**Alors, qu'est-ce que tu attends ? Prépare ton sac vert, et rejoins la fête !**

**👆 FAIRY TAIL !**`

client.once('ready', async () => {
	console.log(`Logged in as ${client.user?.tag}!`)
	try {
		const user = await client.users.fetch(userId)
		await user.send(welcomeMessage)
		console.log(`Message sent to ${user.tag} (${userId})`)
	} catch (error) {
		console.error('Failed to send DM:', error)
	} finally {
		client.destroy()
	}
})

client.login(token)

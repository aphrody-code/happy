import { Category } from '@discordx/utilities'
import {
	ApplicationCommandOptionType,
	ChannelType,
	CommandInteraction,
	EmbedBuilder,
	TextChannel,
} from 'discord.js'
import { Client } from 'discordx'

import { Discord, Guard, Injectable, Slash, SlashOption } from '@/decorators'
import { UserPermissions } from '@/guards'

@Discord()
@Injectable()
@Category('Admin')
export default class RulesCommand {

	@Slash({
		name: 'reglement',
		description: 'Affiche le règlement complet du serveur.',
	})
	@Guard(UserPermissions(['Administrator']))
	async rules(
		@SlashOption({
			name: 'salon',
			description: 'Salon où envoyer le règlement.',
			type: ApplicationCommandOptionType.Channel,
		}) channel: TextChannel | undefined,
			interaction: CommandInteraction,
			client: Client
	) {
		const targetChannel = channel ?? interaction.channel
		if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
			return await interaction.followUp({ content: 'Salon textuel invalide.', ephemeral: true })
		}

		const embeds = this.buildRuleEmbeds()

		await (targetChannel as TextChannel).send({ embeds })

		await interaction.followUp({
			content: `Règlement envoyé dans ${targetChannel.toString()}.`,
			ephemeral: true,
		})
	}

	private buildRuleEmbeds(): EmbedBuilder[] {
		// ── 1. Bienvenue ──
		const welcome = new EmbedBuilder()
			.setColor(0xE8672A)
			.setTitle('📜 Règlement de la Guilde Fairy Tail')
			.setDescription(
				'*Bienvenue, nouveau mage !*\n\n'
				+ 'Tu viens de franchir les portes de **Fairy Tail**, la guilde la plus puissante du Royaume de Fiore. '
				+ 'Ici, nous sommes une famille. Mais même dans une famille, il y a des règles à respecter.\n\n'
				+ 'Lis attentivement ce règlement pour profiter pleinement de la guilde. **Aye !**'
			)
			.setThumbnail('https://static.wikia.nocookie.net/fairytail/images/3/3e/Fairy_Tail_symbol.png')

		// ── 2. Règles générales ──
		const general = new EmbedBuilder()
			.setColor(0x3498DB)
			.setTitle('⚖️ Règles Générales — Le Code des Mages')
			.setDescription(
				'**1.** Respect mutuel obligatoire — pas d\'insultes, de harcèlement ou de discrimination.\n'
				+ '**2.** Pas de contenu NSFW en dehors des salons dédiés.\n'
				+ '**3.** Pas de spam, flood ou publicité non autorisée.\n'
				+ '**4.** Pas d\'usurpation d\'identité ou de faux comptes.\n'
				+ '**5.** Utilise les salons appropriés pour chaque sujet.\n'
				+ '**6.** Pas de spoilers sans balise — utilise `||spoiler||` pour masquer.\n'
				+ '**7.** Écoute les instructions du **Conseil des Mages** (modérateurs) et du **Maître de Guilde** (admin).\n'
				+ '**8.** Le français est la langue principale du serveur.\n\n'
				+ '*Le non-respect de ces règles peut mener à un avertissement, un timeout ou un bannissement.*'
			)

		// ── 3. Hiérarchie du serveur ──
		const hierarchy = new EmbedBuilder()
			.setColor(0xFFD700)
			.setTitle('👑 Hiérarchie du Serveur')
			.setDescription(
				'Le serveur suit la structure d\'une guilde de mages officielle :\n\n'

				+ '**👑 Maître de Guilde**\n'
				+ 'Le dirigeant suprême du serveur. Il prend les décisions finales et '
				+ 'supervise l\'ensemble de la guilde. Dans le manga, le Maître de Guilde (Guild Master) est élu par les membres '
				+ 'et approuvé par le Conseil de la Magie.\n\n'

				+ '**⚖️ Conseil des Mages**\n'
				+ 'Les modérateurs du serveur. Dans l\'univers Fairy Tail, le **Conseil de la Magie** '
				+ '(Magic Council) est l\'organe directeur qui supervise toutes les guildes de mages d\'Ishgar. '
				+ 'Ici, ils veillent au respect des règles et gèrent les conflits.\n\n'

				+ '**🛡️ Chevalier Runique**\n'
				+ 'Les helpers et modérateurs juniors. Les **Chevaliers Runiques** (Rune Knights) '
				+ 'sont les forces armées du Conseil de la Magie, chargés de faire respecter la loi. '
				+ 'Ils assistent le Conseil des Mages.\n\n'

				+ '**⭐ Mage de Rang S**\n'
				+ 'Modérateurs et membres d\'élite du serveur. Les **Mages de Classe S** sont les plus puissants '
				+ 'd\'une guilde — des armées à eux seuls, capables d\'accomplir les missions les plus dangereuses. '
				+ 'Ils peuvent siéger au **Conseil des Mages** et aider à la modération du serveur.'
			)

		// ── 4. Guildes ──
		const guilds = new EmbedBuilder()
			.setColor(0x9B59B6)
			.setTitle('🏰 Système de Guildes')
			.setDescription(
				'Rejoins l\'une des **38 guildes** de l\'univers Fairy Tail avec la commande `/guilde` !\n\n'

				+ '**Guildes Légales** — Approuvées par le Conseil de la Magie.\n'
				+ 'Fairy Tail, Blue Pegasus, Lamia Scale, Sabertooth, Mermaid Heel, Quatro Cerberus, '
				+ 'Twilight Ogre, et bien d\'autres...\n\n'

				+ '**Guildes Clandestines** — Non approuvées, traitées comme criminelles.\n'
				+ 'Phantom Lord, Oración Seis, Grimoire Heart, Tartaros, Raven Tail...\n\n'

				+ '**Guilde Indépendante** — Crime Sorcière, dirigée par Jellal.\n\n'

				+ 'Chaque guilde te donne un rôle et une couleur unique sur le serveur. '
				+ 'Tu peux changer de guilde à tout moment.'
			)

		// ── 5. Commandes utiles ──
		const commands = new EmbedBuilder()
			.setColor(0x95A5A6)
			.setTitle('📋 Commandes Utiles')
			.setDescription(
				'**Général**\n'
				+ '`/help` — Aide générale\n'
				+ '`/ping` — Latence du bot\n'
				+ '`/info` — Informations sur le bot\n'
				+ '`/ticket` — Ouvrir un ticket de support\n'
				+ '`/serverinfo` — Infos du serveur\n'
				+ '`/guilde` — Rejoindre une guilde\n'
				+ '`/sondage` — Créer un sondage\n'
				+ '`/anime` — Regarder un épisode\n\n'

				+ '*Aye ! Amuse-toi bien dans la guilde !* 🐱'
			)

		return [welcome, general, hierarchy, guilds, commands]
	}

}

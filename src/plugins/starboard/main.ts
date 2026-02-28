import { clientConfig } from '../../client'
import { GatewayIntentBits, Partials } from 'discord.js'

// Vérification des partials et intents requis
const config = clientConfig()

if (!config.partials?.includes(Partials.Channel)) throw new Error('Le partial Channel est requis pour le plugin StarBoard !')
if (!config.partials?.includes(Partials.Message)) throw new Error('Le partial Message est requis pour le plugin StarBoard !')
if (!config.partials?.includes(Partials.Reaction)) throw new Error('Le partial Reaction est requis pour le plugin StarBoard !')

if (!(config.intents as GatewayIntentBits[])?.includes(GatewayIntentBits.GuildMessages)) throw new Error("L'intent GuildMessages est requis pour le plugin StarBoard !")
if (!(config.intents as GatewayIntentBits[])?.includes(GatewayIntentBits.MessageContent)) throw new Error("L'intent MessageContent est requis pour le plugin StarBoard !")
if (!(config.intents as GatewayIntentBits[])?.includes(GatewayIntentBits.GuildMessageReactions)) throw new Error("L'intent GuildMessageReactions est requis pour le plugin StarBoard !")

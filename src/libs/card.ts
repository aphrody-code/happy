import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { createCanvas, loadImage } from '@napi-rs/canvas'

// ── Config ──

const CARD_WIDTH = 934
const CARD_HEIGHT = 282
const AVATAR_SIZE = 160
const AVATAR_X = 60
const AVATAR_Y = (CARD_HEIGHT - AVATAR_SIZE) / 2
const BG_PATH = join(__dirname, '..', 'assets', 'card-background.jpg')

const ORANGE = '#E8672A'

// ── Helpers ──

let bgCache: Buffer | null = null
async function loadBg(): Promise<Buffer> {
	if (!bgCache) bgCache = await readFile(BG_PATH)
	return bgCache
}

function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
	ctx.beginPath()
	ctx.moveTo(x + r, y)
	ctx.lineTo(x + w - r, y)
	ctx.quadraticCurveTo(x + w, y, x + w, y + r)
	ctx.lineTo(x + w, y + h - r)
	ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
	ctx.lineTo(x + r, y + h)
	ctx.quadraticCurveTo(x, y + h, x, y + h - r)
	ctx.lineTo(x, y + r)
	ctx.quadraticCurveTo(x, y, x + r, y)
	ctx.closePath()
}

function circleClip(ctx: any, image: any, x: number, y: number, size: number, borderColor = '#ffffff') {
	ctx.save()
	ctx.beginPath()
	ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
	ctx.closePath()
	ctx.clip()
	ctx.drawImage(image, x, y, size, size)
	ctx.restore()

	// Bordure
	ctx.beginPath()
	ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2)
	ctx.strokeStyle = borderColor
	ctx.lineWidth = 4
	ctx.stroke()
}

async function drawBackground(ctx: any, w: number, h: number) {
	const bgData = await loadBg()
	const bg = await loadImage(bgData)
	ctx.drawImage(bg, 0, 0, w, h)

	// Overlay — assez transparent pour garder l'image visible
	ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
	ctx.fillRect(0, 0, w, h)
}

// ── Welcome Card ──

export async function generateWelcomeCard(options: {
	username: string
	avatarUrl: string
	memberCount: number
}): Promise<Buffer> {
	const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT)
	const ctx = canvas.getContext('2d')

	// Clip coins arrondis
	roundRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 20)
	ctx.clip()

	// Background
	await drawBackground(ctx, CARD_WIDTH, CARD_HEIGHT)

	// Avatar
	const avatar = await loadImage(options.avatarUrl)
	circleClip(ctx, avatar, AVATAR_X, AVATAR_Y, AVATAR_SIZE, ORANGE)

	const textX = AVATAR_X + AVATAR_SIZE + 40

	// Titre
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold 36px sans-serif'
	ctx.fillText('Bienvenue à Fairy Tail !', textX, 90)

	// Nom
	ctx.fillStyle = ORANGE
	ctx.font = 'bold 44px sans-serif'
	ctx.fillText(options.username, textX, 150)

	// Compteur
	ctx.fillStyle = '#dddddd'
	ctx.font = '22px sans-serif'
	ctx.fillText(`Membre n°${options.memberCount} de la guilde`, textX, 190)

	// Citation
	ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
	ctx.font = 'italic 18px sans-serif'
	ctx.fillText('« Les fées ont-elles une queue ? »', textX, 235)

	return Buffer.from(await canvas.encode('png'))
}

// ── Profile Card ──

const PROFILE_HEIGHT = 320

export async function generateProfileCard(options: {
	username: string
	avatarUrl: string
	level: number
	xp: number
	xpNeeded: number
	jewels: number
	hp: number
	maxHp: number
	mp: number
	maxMp: number
	location: string
	guild?: string
}): Promise<Buffer> {
	const canvas = createCanvas(CARD_WIDTH, PROFILE_HEIGHT)
	const ctx = canvas.getContext('2d')

	roundRect(ctx, 0, 0, CARD_WIDTH, PROFILE_HEIGHT, 20)
	ctx.clip()

	await drawBackground(ctx, CARD_WIDTH, PROFILE_HEIGHT)

	// Avatar
	const avatar = await loadImage(options.avatarUrl)
	circleClip(ctx, avatar, AVATAR_X, (PROFILE_HEIGHT - AVATAR_SIZE) / 2, AVATAR_SIZE, ORANGE)

	const textX = AVATAR_X + AVATAR_SIZE + 40

	// Nom
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold 40px sans-serif'
	ctx.fillText(options.username, textX, 65)

	// Guilde
	if (options.guild) {
		ctx.fillStyle = ORANGE
		ctx.font = '20px sans-serif'
		ctx.fillText(options.guild, textX, 92)
	}

	// Niveau à droite
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold 28px sans-serif'
	ctx.textAlign = 'right'
	ctx.fillText(`Nv. ${options.level}`, CARD_WIDTH - 50, 65)
	ctx.textAlign = 'left'

	// Barre XP
	const barX = textX
	const barY = 110
	const barW = CARD_WIDTH - textX - 50
	const barH = 24
	const xpRatio = Math.min(options.xp / options.xpNeeded, 1)

	// Fond barre
	roundRect(ctx, barX, barY, barW, barH, 12)
	ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
	ctx.fill()

	// Remplissage
	if (xpRatio > 0) {
		const fillW = Math.max(barH, barW * xpRatio) // minimum = hauteur pour garder les coins ronds
		roundRect(ctx, barX, barY, fillW, barH, 12)
		ctx.fillStyle = ORANGE
		ctx.fill()
	}

	// Texte XP
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold 14px sans-serif'
	ctx.fillText(`${options.xp} / ${options.xpNeeded} XP`, barX + 10, barY + 17)

	// Stats — texte simple sans emojis
	const statsY = 175
	const col1 = textX
	const col2 = textX + 250
	const lineH = 34

	ctx.font = '22px sans-serif'

	ctx.fillStyle = '#E74C3C'
	ctx.fillText(`PV  ${options.hp} / ${options.maxHp}`, col1, statsY)
	ctx.fillStyle = '#3498DB'
	ctx.fillText(`PM  ${options.mp} / ${options.maxMp}`, col1, statsY + lineH)

	ctx.fillStyle = '#F1C40F'
	ctx.fillText(`Joyaux  ${options.jewels.toLocaleString('fr-FR')}`, col2, statsY)
	ctx.fillStyle = '#2ECC71'
	ctx.fillText(`Lieu  ${options.location}`, col2, statsY + lineH)

	// Ligne décorative
	ctx.fillStyle = ORANGE
	roundRect(ctx, 30, PROFILE_HEIGHT - 20, CARD_WIDTH - 60, 4, 2)
	ctx.fill()

	return Buffer.from(await canvas.encode('png'))
}

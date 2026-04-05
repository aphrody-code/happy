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
const MAX_TEXT_WIDTH = CARD_WIDTH - AVATAR_X - AVATAR_SIZE - 40 - 50 // marge droite

// ── Helpers ──

let bgCache: Buffer | null = null
async function loadBg(): Promise<Buffer> {
	if (!bgCache) {
		try {
			bgCache = await readFile(BG_PATH)
		} catch {
			// Fallback : fond noir si l'image est manquante
			const fallback = createCanvas(CARD_WIDTH, 400)
			const fctx = fallback.getContext('2d')
			fctx.fillStyle = '#1a1a2e'
			fctx.fillRect(0, 0, CARD_WIDTH, 400)
			bgCache = Buffer.from(await fallback.encode('png'))
		}
	}

	return bgCache
}

function truncateText(ctx: any, text: string, maxWidth: number): string {
	const measured = ctx.measureText(text)
	if (measured.width <= maxWidth) return text

	let truncated = text
	while (ctx.measureText(`${truncated}...`).width > maxWidth && truncated.length > 0) {
		truncated = truncated.slice(0, -1)
	}

	return `${truncated}...`
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

async function loadAvatarSafe(url: string): Promise<any> {
	try {
		return await loadImage(url)
	} catch {
		// Fallback : cercle gris si l'avatar ne charge pas
		const size = 512
		const fallback = createCanvas(size, size)
		const fctx = fallback.getContext('2d')
		fctx.fillStyle = '#4a4a6a'
		fctx.beginPath()
		fctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
		fctx.fill()
		// Initiales
		fctx.fillStyle = '#ffffff'
		fctx.font = `bold ${size / 2}px sans-serif`
		fctx.textAlign = 'center'
		fctx.fillText('?', size / 2, size / 2 + size / 6)

		return await loadImage(Buffer.from(await fallback.encode('png')))
	}
}

async function drawBackground(ctx: any, w: number, h: number) {
	const bgData = await loadBg()
	const bg = await loadImage(bgData)
	ctx.drawImage(bg, 0, 0, w, h)

	// Overlay
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

	// Avatar (avec fallback)
	const avatar = await loadAvatarSafe(options.avatarUrl)
	circleClip(ctx, avatar, AVATAR_X, AVATAR_Y, AVATAR_SIZE, ORANGE)

	const textX = AVATAR_X + AVATAR_SIZE + 40

	// Titre
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold 36px sans-serif'
	ctx.fillText('Bienvenue à Fairy Tail !', textX, 90)

	// Nom (tronqué si trop long)
	ctx.fillStyle = ORANGE
	ctx.font = 'bold 44px sans-serif'
	ctx.fillText(truncateText(ctx, options.username, MAX_TEXT_WIDTH), textX, 150)

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
	rank?: number
}): Promise<Buffer> {
	const canvas = createCanvas(CARD_WIDTH, PROFILE_HEIGHT)
	const ctx = canvas.getContext('2d')

	roundRect(ctx, 0, 0, CARD_WIDTH, PROFILE_HEIGHT, 20)
	ctx.clip()

	await drawBackground(ctx, CARD_WIDTH, PROFILE_HEIGHT)

	// Avatar (avec fallback)
	const avatar = await loadAvatarSafe(options.avatarUrl)
	circleClip(ctx, avatar, AVATAR_X, (PROFILE_HEIGHT - AVATAR_SIZE) / 2, AVATAR_SIZE, ORANGE)

	const textX = AVATAR_X + AVATAR_SIZE + 40

	// Nom (tronqué si trop long)
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold 40px sans-serif'
	ctx.fillText(truncateText(ctx, options.username, MAX_TEXT_WIDTH - 120), textX, 65)

	// Guilde
	if (options.guild) {
		ctx.fillStyle = ORANGE
		ctx.font = '20px sans-serif'
		ctx.fillText(truncateText(ctx, options.guild, MAX_TEXT_WIDTH), textX, 92)
	}

	// Niveau + rang à droite
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold 28px sans-serif'
	ctx.textAlign = 'right'
	ctx.fillText(`Nv. ${options.level}`, CARD_WIDTH - 50, 55)
	if (options.rank) {
		ctx.font = '18px sans-serif'
		ctx.fillStyle = '#aaaaaa'
		ctx.fillText(`#${options.rank}`, CARD_WIDTH - 50, 80)
	}
	ctx.textAlign = 'left'

	// Barre XP
	const barX = textX
	const barY = 110
	const barW = CARD_WIDTH - textX - 50
	const barH = 24
	const xpRatio = options.xpNeeded > 0 ? Math.min(options.xp / options.xpNeeded, 1) : 0

	// Fond barre
	roundRect(ctx, barX, barY, barW, barH, 12)
	ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
	ctx.fill()

	// Remplissage
	if (xpRatio > 0) {
		const fillW = Math.max(barH, barW * xpRatio)
		roundRect(ctx, barX, barY, fillW, barH, 12)
		ctx.fillStyle = ORANGE
		ctx.fill()
	}

	// Texte XP
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold 14px sans-serif'
	ctx.fillText(`${options.xp} / ${options.xpNeeded} XP`, barX + 10, barY + 17)

	// Stats
	const statsY = 175
	const col1 = textX
	const col2 = textX + 250
	const lineH = 34

	ctx.font = '22px sans-serif'

	// Barres de vie/mana miniatures
	const miniBarW = 200
	const miniBarH = 16

	// PV
	ctx.fillStyle = '#E74C3C'
	ctx.fillText('PV', col1, statsY)
	roundRect(ctx, col1 + 35, statsY - 14, miniBarW, miniBarH, 8)
	ctx.fillStyle = 'rgba(231, 76, 60, 0.2)'
	ctx.fill()
	if (options.maxHp > 0) {
		const hpRatio = Math.min(options.hp / options.maxHp, 1)
		roundRect(ctx, col1 + 35, statsY - 14, Math.max(miniBarH, miniBarW * hpRatio), miniBarH, 8)
		ctx.fillStyle = '#E74C3C'
		ctx.fill()
	}
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold 12px sans-serif'
	ctx.fillText(`${options.hp}/${options.maxHp}`, col1 + 42, statsY - 2)

	// PM
	ctx.font = '22px sans-serif'
	ctx.fillStyle = '#3498DB'
	ctx.fillText('PM', col1, statsY + lineH)
	roundRect(ctx, col1 + 35, statsY + lineH - 14, miniBarW, miniBarH, 8)
	ctx.fillStyle = 'rgba(52, 152, 219, 0.2)'
	ctx.fill()
	if (options.maxMp > 0) {
		const mpRatio = Math.min(options.mp / options.maxMp, 1)
		roundRect(ctx, col1 + 35, statsY + lineH - 14, Math.max(miniBarH, miniBarW * mpRatio), miniBarH, 8)
		ctx.fillStyle = '#3498DB'
		ctx.fill()
	}
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold 12px sans-serif'
	ctx.fillText(`${options.mp}/${options.maxMp}`, col1 + 42, statsY + lineH - 2)

	// Joyaux et Lieu
	ctx.font = '22px sans-serif'
	ctx.fillStyle = '#F1C40F'
	ctx.fillText(`Joyaux  ${options.jewels.toLocaleString('fr-FR')}`, col2, statsY)
	ctx.fillStyle = '#2ECC71'
	ctx.fillText(truncateText(ctx, `Lieu  ${options.location}`, CARD_WIDTH - col2 - 50), col2, statsY + lineH)

	// Ligne décorative
	ctx.fillStyle = ORANGE
	roundRect(ctx, 30, PROFILE_HEIGHT - 20, CARD_WIDTH - 60, 4, 2)
	ctx.fill()

	return Buffer.from(await canvas.encode('png'))
}

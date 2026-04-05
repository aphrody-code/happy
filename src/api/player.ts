import { Router } from 'express'

import { AnimeService } from '@/services'
import { resolveDependency } from '@/utils/functions'

export const playerRouter = Router()

let animeService: AnimeService | null = null

async function getAnimeService(): Promise<AnimeService> {
	if (!animeService) {
		animeService = await resolveDependency(AnimeService)
	}
	return animeService
}

function escapeHtml(str: string): string {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

playerRouter.get('/watch/:id', async (req, res) => {
	try {
		const id = req.params.id
		const match = id.match(/^(ft|100yq)-(\d+)$/)
		if (!match) {
			res.status(404).send(render404Page('Format invalide. Utilisez /watch/ft-1 ou /watch/100yq-5'))
			return
		}

		const showPrefix = match[1] as 'ft' | '100yq'
		const episodeNumber = parseInt(match[2])

		const service = await getAnimeService()
		const episode = service.getEpisode(showPrefix, episodeNumber)

		if (!episode) {
			const total = service.getTotalEpisodes(showPrefix)
			res.status(404).send(render404Page(`Episode ${episodeNumber} introuvable. Il y a ${total} épisodes disponibles.`))
			return
		}

		const mp4 = service.getDirectMp4(showPrefix, episodeNumber)
		if (!mp4) {
			res.status(404).send(render404Page(`Aucun lien vidéo disponible pour cet épisode.`))
			return
		}

		const total = service.getTotalEpisodes(showPrefix)
		const prevId = episodeNumber > 1 ? `${showPrefix}-${episodeNumber - 1}` : null
		const nextId = episodeNumber < total ? `${showPrefix}-${episodeNumber + 1}` : null

		res.send(renderPlayerPage(episode, mp4, prevId, nextId))
	} catch (err) {
		console.error('Player error:', err)
		res.status(500).send(render404Page('Erreur interne du serveur.'))
	}
})

playerRouter.get('/watch', async (_req, res) => {
	try {
		const service = await getAnimeService()

		const ftTotal = service.getTotalEpisodes('ft')
		const yqTotal = service.getTotalEpisodes('100yq')

		const ftEpisodes: { id: string, number: number, title: string, title_ja?: string | null, thumbnail?: string | null }[] = []
		for (let i = 1; i <= ftTotal; i++) {
			const ep = service.getEpisode('ft', i)
			if (ep) ftEpisodes.push(ep)
		}

		const yqEpisodes: { id: string, number: number, title: string, title_ja?: string | null, thumbnail?: string | null }[] = []
		for (let i = 1; i <= yqTotal; i++) {
			const ep = service.getEpisode('100yq', i)
			if (ep) yqEpisodes.push(ep)
		}

		res.send(renderIndexPage(ftEpisodes, yqEpisodes))
	} catch (err) {
		console.error('Player index error:', err)
		res.status(500).send(render404Page('Erreur interne du serveur.'))
	}
})

function renderPlayerPage(
	episode: { id: string, number: number, title: string, title_ja?: string | null, show: string, thumbnail?: string | null },
	mp4Url: string,
	prevId: string | null,
	nextId: string | null
): string {
	const title = escapeHtml(`${episode.show} #${episode.number} — ${episode.title}`)
	const titleJa = episode.title_ja ? escapeHtml(episode.title_ja) : ''
	const poster = episode.thumbnail ? `poster="${escapeHtml(episode.thumbnail)}"` : ''

	return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#1a1a2e;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center}
.header{width:100%;background:linear-gradient(135deg,#16213e,#0f3460);padding:16px 24px;text-align:center;border-bottom:2px solid #e94560}
.header h1{font-size:1.1rem;color:#f5a623;margin-bottom:4px}
.header .subtitle{font-size:0.85rem;color:#a0a0b0;font-style:italic}
.player-wrap{width:100%;max-width:960px;padding:20px;flex:1}
video{width:100%;border-radius:8px;background:#000;box-shadow:0 4px 20px rgba(0,0,0,0.5)}
.nav{display:flex;justify-content:space-between;align-items:center;margin-top:16px;gap:12px}
.nav a{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:linear-gradient(135deg,#e94560,#c73650);color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:0.9rem;transition:transform 0.15s,opacity 0.15s}
.nav a:hover{transform:translateY(-1px);opacity:0.9}
.nav a.disabled{opacity:0.3;pointer-events:none;background:#555}
.nav .ep-info{color:#a0a0b0;font-size:0.85rem}
.footer{padding:16px;text-align:center;color:#555;font-size:0.75rem}
@media(max-width:600px){
.header h1{font-size:0.95rem}
.nav a{padding:8px 14px;font-size:0.8rem}
}
</style>
</head>
<body>
<div class="header">
<h1>${title}</h1>
${titleJa ? `<div class="subtitle">${titleJa}</div>` : ''}
</div>
<div class="player-wrap">
<video controls ${poster} preload="metadata" crossorigin="anonymous">
<source src="${escapeHtml(mp4Url)}" type="video/mp4">
Votre navigateur ne supporte pas la lecture vidéo.
</video>
<div class="nav">
<a href="/watch/${prevId}" ${!prevId ? 'class="disabled" tabindex="-1"' : ''}>&#9664; Précédent</a>
<span class="ep-info">Episode ${episode.number}</span>
<a href="/watch/${nextId}" ${!nextId ? 'class="disabled" tabindex="-1"' : ''}>Suivant &#9654;</a>
</div>
</div>
<div class="footer">Fairy Tail FR &mdash; Happy Bot</div>
</body>
</html>`
}

function render404Page(message: string): string {
	return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>404 — Non trouvé</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#1a1a2e;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px}
h1{font-size:4rem;color:#e94560;margin-bottom:12px}
p{font-size:1.1rem;color:#a0a0b0;margin-bottom:24px}
a{color:#f5a623;text-decoration:none;font-weight:600}
a:hover{text-decoration:underline}
</style>
</head>
<body>
<h1>404</h1>
<p>${escapeHtml(message)}</p>
<a href="/watch">&#8592; Retour à la liste des épisodes</a>
</body>
</html>`
}

function renderIndexPage(
	ftEpisodes: { id: string, number: number, title: string, title_ja?: string | null, thumbnail?: string | null }[],
	yqEpisodes: { id: string, number: number, title: string, title_ja?: string | null, thumbnail?: string | null }[]
): string {
	function renderEpisodeCards(episodes: typeof ftEpisodes): string {
		return episodes.map(ep => {
			const thumb = ep.thumbnail
				? `<img src="${escapeHtml(ep.thumbnail)}" alt="" loading="lazy">`
				: '<div class="no-thumb">🎬</div>'
			return `<a href="/watch/${escapeHtml(ep.id)}" class="card">
${thumb}
<div class="card-info">
<span class="ep-num">#${ep.number}</span>
<span class="ep-title">${escapeHtml(ep.title)}</span>
${ep.title_ja ? `<span class="ep-title-ja">${escapeHtml(ep.title_ja)}</span>` : ''}
</div>
</a>`
		}).join('\n')
	}

	return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fairy Tail — Episodes</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#1a1a2e;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh}
.header{width:100%;background:linear-gradient(135deg,#16213e,#0f3460);padding:24px;text-align:center;border-bottom:2px solid #e94560}
.header h1{font-size:1.5rem;color:#f5a623}
.header p{color:#a0a0b0;margin-top:6px;font-size:0.9rem}
.content{max-width:1200px;margin:0 auto;padding:24px}
h2{color:#f5a623;font-size:1.2rem;margin:24px 0 16px;padding-bottom:8px;border-bottom:1px solid #333}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}
.card{display:flex;flex-direction:column;background:#16213e;border-radius:8px;overflow:hidden;text-decoration:none;color:#e0e0e0;transition:transform 0.15s,box-shadow 0.15s;border:1px solid #2a2a4a}
.card:hover{transform:translateY(-3px);box-shadow:0 6px 20px rgba(233,69,96,0.2);border-color:#e94560}
.card img{width:100%;aspect-ratio:16/9;object-fit:cover;background:#0a0a1a}
.card .no-thumb{width:100%;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;background:#0a0a1a;font-size:2rem}
.card-info{padding:10px 12px}
.ep-num{font-size:0.75rem;color:#e94560;font-weight:700}
.ep-title{display:block;font-size:0.85rem;margin-top:4px;line-height:1.3}
.ep-title-ja{display:block;font-size:0.75rem;color:#888;margin-top:2px;font-style:italic}
.footer{padding:24px;text-align:center;color:#555;font-size:0.75rem}
@media(max-width:500px){
.grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
}
</style>
</head>
<body>
<div class="header">
<h1>Fairy Tail — Episodes</h1>
<p>${ftEpisodes.length + yqEpisodes.length} épisodes disponibles</p>
</div>
<div class="content">
<h2>Fairy Tail (Saisons 1-9) — ${ftEpisodes.length} épisodes</h2>
<div class="grid">
${renderEpisodeCards(ftEpisodes)}
</div>
${yqEpisodes.length > 0 ? `
<h2>Fairy Tail: 100 Years Quest — ${yqEpisodes.length} épisodes</h2>
<div class="grid">
${renderEpisodeCards(yqEpisodes)}
</div>
` : ''}
</div>
<div class="footer">Fairy Tail FR &mdash; Happy Bot</div>
</body>
</html>`
}

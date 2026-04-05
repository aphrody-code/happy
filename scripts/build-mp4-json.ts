import fs from 'fs';
import path from 'path';
import axios from 'axios';

const OUTPUT_DIR = path.resolve(process.cwd(), 'data');

async function resolveDirectLink(url: string): Promise<string | null> {
    if (!url) return null;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://anime-sama.tv/'
            },
            timeout: 8000
        });

        const html = response.data;

        // 1. Sibnet Pattern
        if (url.includes('sibnet.ru')) {
            const match = html.match(/\/v\/[^"']+\.mp4/);
            if (match) return `https://video.sibnet.ru${match[0]}`;
        }

        // 2. Sendvid Pattern
        if (url.includes('sendvid.com')) {
            const match = html.match(/https?:\/\/[^"']+\.mp4/i);
            if (match) return match[0];
        }

        // 3. Generic MP4 in Script/HTML (Works for some players)
        const genericMatch = html.match(/["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i);
        if (genericMatch) return genericMatch[1];

        // 4. Vidmoly/OneUpload (Advanced check)
        // Look for sources: [{file:"..."}]
        const fileMatch = html.match(/file\s*:\s*["'](https?:\/\/[^"']+)["']/i);
        if (fileMatch) return fileMatch[1];

    } catch (error: any) {
        // Silent fail to allow trying next source
    }
    return null;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateMp4Json() {
    const inputPath = path.join(OUTPUT_DIR, 'episodes-detailed.json');
    const outputPath = path.join(OUTPUT_DIR, 'episodes-mp4.json');

    const detailedData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    const mp4List: any[] = [];

    console.log(`Fixing and resolving ${detailedData.length} episodes...`);

    for (let i = 0; i < detailedData.length; i++) {
        const ep = detailedData[i];
        let mp4Link = null;
        let usedSource = null;

        // Strategy: Try all sources in order of reliability
        const sourcesToTry = [
            ep.sources.sibnet,
            ep.sources.sendvid,
            ep.sources.vidmoly,
            ep.sources.oneupload
        ].filter(url => url !== null);

        for (const source of sourcesToTry) {
            mp4Link = await resolveDirectLink(source);
            if (mp4Link) {
                usedSource = source;
                break; 
            }
        }

        mp4List.push({
            id: ep.id,
            show: ep.show,
            number: ep.number,
            title: ep.title,
            mp4: mp4Link,
            fallback: usedSource || sourcesToTry[0] || null
        });

        if (mp4Link) {
            console.log(`[${i + 1}/${detailedData.length}] ✅ FIXED: ${ep.title} via ${new URL(mp4Link).hostname}`);
        } else {
            console.log(`[${i + 1}/${detailedData.length}] ❌ FAILED: ${ep.title}`);
        }

        if (i % 10 === 0) await sleep(300); // Small throttle
    }

    fs.writeFileSync(outputPath, JSON.stringify(mp4List, null, 2));
    console.log(`\nDone! Total MP4: ${mp4List.filter(e => e.mp4).length}/${detailedData.length}`);
}

generateMp4Json();

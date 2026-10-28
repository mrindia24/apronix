// Downloads the Manrope variable font (latin) into /public/fonts so the app
// self-hosts it at runtime without network access. Run: node scripts/fetch-fonts.mjs
import { writeFile } from 'node:fs/promises';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';
const url = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&display=swap';
const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\) format\('woff2'\)/);
if (!match) throw new Error('Could not locate woff2 in Google CSS');
const buf = Buffer.from(await (await fetch(match[1], { headers: { 'User-Agent': UA } })).arrayBuffer());
await writeFile(new URL('../public/fonts/manrope-latin.woff2', import.meta.url), buf);
// latin-ext
const match2 = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\) format\('woff2'\)/g)][1];
if (match2) {
  const b2 = Buffer.from(await (await fetch(match2[1], { headers: { 'User-Agent': UA } })).arrayBuffer());
  await writeFile(new URL('../public/fonts/manrope-latin-ext.woff2', import.meta.url), b2);
}
console.log('fonts written', buf.length);

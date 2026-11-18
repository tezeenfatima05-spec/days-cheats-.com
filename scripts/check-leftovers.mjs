import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const blocked = [/dead by daylight/i, /deadside/i, /once human/i, /deadlock/i, /overwatch(?: 2)?/i, /apex legends/i, /escape from tarkov/i, /valorant/i, /\bhania\b/i, /dbd-cheat\.com/i, /oncecheats\.com/i, /deadlock-cheat\.com/i, /overwatch2-cheats\.com/i];
const scan = (dir) => existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? scan(join(dir, entry.name)) : [join(dir, entry.name)]) : [];
const files = [...scan(join(root, 'src')), ...scan(join(root, 'public')), ...scan(join(root, 'dist'))].filter((file) => /\.(astro|ts|js|mjs|html|xml|txt|json)$/i.test(file));
const findings = [];
for (const file of files) { const text = readFileSync(file, 'utf8'); for (const pattern of blocked) if (pattern.test(text)) findings.push(`${file}: ${pattern}`); }
if (findings.length) { console.error('Leftover check failed:\n' + findings.join('\n')); process.exit(1); }
const html = scan(join(root, 'dist')).filter((file) => file.endsWith('.html') && !file.includes(`${join('go')}`));
for (const file of html) { const text = readFileSync(file, 'utf8'); if (!/<title>[^<]+<\/title>/.test(text) || !/<meta name="description" content="[^"]+"/.test(text) || !/<link rel="canonical" href="https:\/\/dayscheats\.com\//.test(text) || (text.match(/<h1[\s>]/g) ?? []).length !== 1) { console.error(`SEO check failed: ${file}`); process.exit(1); } }
console.log(`Passed leftovers and metadata checks across ${html.length} public HTML pages.`);

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const projectFile = (path) => new URL(`../${path}`, import.meta.url);

test('declares purpose-built browser and installable app icons', async () => {
    const html = await readFile(projectFile('index.html'), 'utf8');

    assert.match(html, /rel="icon"[^>]+href="\/favicon\.ico"/);
    assert.match(html, /rel="icon"[^>]+sizes="16x16"[^>]+href="\/favicon-16\.png"/);
    assert.match(html, /rel="icon"[^>]+sizes="32x32"[^>]+href="\/favicon-32\.png"/);
    assert.match(html, /rel="apple-touch-icon"[^>]+href="\/apple-touch-icon\.png"/);
    assert.match(html, /rel="manifest"[^>]+href="\/manifest\.webmanifest"/);
    assert.doesNotMatch(html, /\/favicon\.svg/);
});

test('web app manifest maps each app icon to its actual resolution', async () => {
    const manifest = JSON.parse(await readFile(projectFile('public/manifest.webmanifest'), 'utf8'));

    assert.deepEqual(
        manifest.icons.map(({ src, sizes, type }) => ({ src, sizes, type })),
        [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
    );

    await Promise.all([
        'public/logo.svg',
        'public/favicon.ico',
        'public/favicon-16.png',
        'public/favicon-32.png',
        'public/apple-touch-icon.png',
        'public/icon-192.png',
        'public/icon-512.png',
    ].map((path) => access(projectFile(path))));
});

test('login shows the service logo without replacing the school watermark', async () => {
    const login = await readFile(projectFile('src/pages/Login/Login.jsx'), 'utf8');

    assert.match(login, /src="\/logo\.svg"/);
    assert.match(login, /alt="율곡"/);
    assert.match(login, /className="h-10 w-auto"/);
    assert.match(login, /src="\/uos_logo\.svg"/);
    assert.doesNotMatch(login, /<img src="" /);
});

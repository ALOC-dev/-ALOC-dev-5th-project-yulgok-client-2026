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

    assert.equal(manifest.name, '이룸매이트');
    assert.equal(manifest.short_name, '이룸매이트');
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

test('browser and installed app use the service name', async () => {
    const html = await readFile(projectFile('index.html'), 'utf8');

    assert.match(html, /<title>이룸매이트<\/title>/);
    assert.match(html, /name="apple-mobile-web-app-title" content="이룸매이트"/);
});

test('login shows the service logo without replacing the school watermark', async () => {
    const login = await readFile(projectFile('src/pages/Login/Login.jsx'), 'utf8');

    assert.match(login, /src="\/logo\.svg"/);
    assert.match(login, /alt="율곡"/);
    assert.match(login, /className="h-10 w-auto"/);
    assert.match(login, /<p[^>]*>이룸메이트<\/p>/);
    assert.match(login, /src="\/uos_logo\.svg"/);
    assert.doesNotMatch(login, /<img src="" /);
});

test('chat profiles use a neutral avatar instead of the service favicon', async () => {
    const chatComponentPaths = [
        'src/pages/Chat/components/ChatListItem.jsx',
        'src/pages/Chat/components/ChatRoomHeader.jsx',
        'src/pages/Chat/components/MessageItem.jsx',
    ];
    const [profileAvatar, ...chatSources] = await Promise.all([
        readFile(projectFile('src/pages/Chat/components/ProfileAvatar.jsx'), 'utf8').catch(() => ''),
        ...chatComponentPaths.map((path) => readFile(projectFile(path), 'utf8')),
    ]);

    assert.match(profileAvatar, /function ProfileAvatar/);
    assert.match(profileAvatar, /setFailedImageUrl\(imageUrl\)/);
    assert.match(profileAvatar, /failedImageUrl !== imageUrl/);
    assert.doesNotMatch(profileAvatar, /useEffect/);
    assert.match(profileAvatar, /aria-hidden="true"/);

    for (const source of chatSources) {
        assert.doesNotMatch(source, /\/favicon\.svg/);
        assert.match(source, /<ProfileAvatar/);
    }
});

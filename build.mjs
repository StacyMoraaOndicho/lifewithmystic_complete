import fs from 'fs-extra';
import matter from 'gray-matter';
import { marked } from 'marked';

const root = new URL('.', import.meta.url).pathname;
const dist = root + 'dist';
const staticDir = root + 'static';

await fs.remove(dist);
await fs.copy(staticDir, dist);

// Load templates
const base = await fs.readFile(root + 'templates/base.html', 'utf8');
const postTpl = await fs.readFile(root + 'templates/post.html', 'utf8');
const catTpl = await fs.readFile(root + 'templates/category.html', 'utf8');

const site = {
  title: 'lifewithmystic',
  description: 'Mystical life with a pilgrim — poetry and journal.',
  url: ''
};
const year = new Date().getFullYear();

function renderBase(title, description, url, body){
  return base
    .replaceAll('{title}', title)
    .replaceAll('{description}', description)
    .replaceAll('{url}', url)
    .replaceAll('{year}', String(year))
    .replace('{body}', body);
}

function renderPost(meta, contentHtml, url){
  return postTpl
    .replaceAll('{title}', meta.title || 'Untitled')
    .replaceAll('{description}', meta.excerpt || '')
    .replaceAll('{category}', meta.category || 'post')
    .replaceAll('{Category}', (meta.category||'post').charAt(0).toUpperCase()+(meta.category||'post').slice(1))
    .replaceAll('{date}', meta.date || '')
    .replaceAll('{content}', contentHtml)
    .replaceAll('{tags}', (meta.tags||[]).join(', '))
    .replaceAll('{year}', String(year))
    .replaceAll('{url}', url);
}

function renderCategory(name, tilesHtml){
  return catTpl
    .replaceAll('{Category}', name.charAt(0).toUpperCase()+name.slice(1))
    .replaceAll('{year}', String(year))
    .replace('{tiles}', tilesHtml);
}

const postsDir = root + 'content/posts';
const files = (await fs.readdir(postsDir)).filter(f => f.endsWith('.md')).sort().reverse();
let posts = [];
let cats = {};

for (const file of files){
  const raw = await fs.readFile(`${postsDir}/${file}`, 'utf8');
  const { data, content } = matter(raw);
  const slug = file.replace(/\.md$/, '');
  const url = `/posts/${slug}/index.html`;
  const html = marked.parse(content);
  const outDir = `${dist}/posts/${slug}`;
  await fs.ensureDir(outDir);
  await fs.writeFile(`${outDir}/index.html`, renderPost(data, html, url), 'utf8');

  const info = {
    title: data.title || 'Untitled',
    date: data.date || '',
    category: data.category || 'post',
    tags: data.tags || [],
    excerpt: data.excerpt || '',
    url
  };
  posts.push(info);
  (cats[info.category] ||= []).push(info);
}

await fs.writeJSON(`${dist}/posts.json`, posts, {spaces:2});

// category pages
for (const [cat, items] of Object.entries(cats)){
  let tiles = items.map(p => `
<a class="tile" href="${p.url}">
  <div class="cover"></div>
  <div class="content">
    <div class="meta">${cat.charAt(0).toUpperCase()+cat.slice(1)} · ${p.date}</div>
    <h3>${p.title}</h3>
    <p class="meta">${p.excerpt||''}</p>
  </div>
</a>`).join('\n');
  const dir = `${dist}/category/${cat}`;
  await fs.ensureDir(dir);
  await fs.writeFile(`${dir}/index.html`, renderCategory(cat, tiles), 'utf8');
}

// pages
const indexBody = await fs.readFile(root + 'templates/home-body.html', 'utf8');
await fs.writeFile(`${dist}/index.html`, renderBase(site.title, site.description, site.url, indexBody), 'utf8');

const quotesBody = await fs.readFile(root + 'templates/quotes-body.html', 'utf8');
await fs.writeFile(`${dist}/quotes.html`, renderBase('Quotes · lifewithmystic', 'Mystical quotes to sprinkle between tiles.', site.url + '/quotes.html', quotesBody), 'utf8');

const searchBody = await fs.readFile(root + 'templates/search-body.html', 'utf8');
await fs.writeFile(`${dist}/search.html`, renderBase('Search · lifewithmystic', 'Find poems and journal entries.', site.url + '/search.html', searchBody), 'utf8');

const aboutBody = await fs.readFile(root + 'templates/about-body.html', 'utf8');
await fs.writeFile(`${dist}/about.html`, renderBase('About · lifewithmystic', 'About lifewithmystic.', site.url + '/about.html', aboutBody), 'utf8');

const contactBody = await fs.readFile(root + 'templates/contact-body.html', 'utf8');
await fs.writeFile(`${dist}/contact.html`, renderBase('Contact · lifewithmystic', 'Say hi.', site.url + '/contact.html', contactBody), 'utf8');

// Copy admin and redirects into dist so Netlify CMS works
const adminDir = root + 'admin';
if (await fs.pathExists(adminDir)) {
  await fs.copy(adminDir, dist + '/admin');
}
// Ensure Netlify redirects file is in publish dir
const redirectsFile = root + '_redirects';
if (await fs.pathExists(redirectsFile)) {
  await fs.copy(redirectsFile, dist + '/_redirects');
}

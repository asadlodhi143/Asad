const fs   = require('fs');
const path = require('path');

// Works whether run from repo root OR from site/ folder
const SITE_DIR  = __dirname;
const POSTS_DIR = path.join(SITE_DIR, 'posts');
const OUTPUT    = path.join(SITE_DIR, 'posts.json');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    let val   = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1,-1).split(',').map(v => v.trim().replace(/^["']|["']$/g,''));
    }
    meta[key] = val;
  });
  return { meta, body: match[2].trim() };
}

function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/^> (.+)$/gm,    '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm,    '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>\n?)+/g, s => '<ul>' + s + '</ul>')
    .replace(/^---$/gm, '<hr/>')
    .split('\n\n').map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<[h1-6|ul|ol|bl|hr]/.test(block)) return block;
      return '<p>' + block + '</p>';
    }).join('\n');
}

function readTime(text) {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200)) + ' min read';
}

if (!fs.existsSync(POSTS_DIR)) {
  console.log('No posts folder found, creating empty posts.json');
  fs.writeFileSync(OUTPUT, '[]');
  process.exit(0);
}

const files = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md'))
  .sort().reverse();

if (files.length === 0) {
  console.log('No .md files found, creating empty posts.json');
  fs.writeFileSync(OUTPUT, '[]');
  process.exit(0);
}

const posts = files.map((file, idx) => {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', '');

  let dateStr = meta.date || '';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d)) dateStr = d.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  } catch(e) {}

  return {
    id:        idx + 1,
    slug,
    file,
    title:     meta.title    || 'Untitled Post',
    date:      dateStr,
    rawDate:   meta.date     || '',
    category:  meta.category || 'General',
    summary:   meta.summary  || '',
    thumbnail: meta.thumbnail|| '',
    tags:      Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
    readTime:  readTime(body),
    featured:  idx === 0,
    bodyHtml:  mdToHtml(body)
  };
});

fs.writeFileSync(OUTPUT, JSON.stringify(posts, null, 2));
console.log('Built ' + posts.length + ' posts to ' + OUTPUT);

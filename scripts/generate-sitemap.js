import { writeFileSync } from 'node:fs'
import { categories, products } from '../src/data/products.js'

const SITE_URL = 'https://brincaesente.com'

const staticPages = [
  { path: '/', priority: '1.0' },
  { path: '/loja', priority: '0.9' },
  { path: '/sobre', priority: '0.5' },
  { path: '/como-funciona', priority: '0.5' },
  { path: '/contato', priority: '0.5' },
  { path: '/faq', priority: '0.5' },
  { path: '/acessibilidade', priority: '0.3' },
  { path: '/politica-trocas', priority: '0.3' },
]

const categoryPages = categories.map((c) => ({ path: `/loja/${c.slug}`, priority: '0.7' }))
const productPages = products.map((p) => ({ path: `/produto/${p.slug}`, priority: '0.8' }))

const urls = [...staticPages, ...categoryPages, ...productPages]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${SITE_URL}${u.path}</loc>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
console.log(`sitemap.xml gerado com ${urls.length} URLs.`)

import { getDb } from '../lib/db.js'
import { requireAdmin } from '../lib/auth.js'
import { rowToProduct } from './products.js'

const DIACRITICS_REGEX = /[̀-ͯ]/g

function slugify(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function uniqueSlug(db, base, ignoreId) {
  let slug = slugify(base) || `produto-${Date.now()}`
  let candidate = slug
  let n = 2
  while (true) {
    const result = await db.execute({
      sql: ignoreId ? 'SELECT id FROM crm_products WHERE slug = ? AND id != ?' : 'SELECT id FROM crm_products WHERE slug = ?',
      args: ignoreId ? [candidate, ignoreId] : [candidate],
    })
    if (result.rows.length === 0) return candidate
    candidate = `${slug}-${n}`
    n += 1
  }
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  const db = await getDb()

  if (req.method === 'GET') {
    const result = await db.execute('SELECT * FROM crm_products ORDER BY created_at DESC')
    return res.json({ products: result.rows.map(rowToProduct) })
  }

  if (req.method === 'POST') {
    const b = req.body || {}
    if (!b.name?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' })

    const slug = await uniqueSlug(db, b.slug || b.name)
    const id = `p-${Date.now().toString(36)}`

    await db.execute({
      sql: `INSERT INTO crm_products
        (id, slug, name, category, price, installments, rating, reviews_count, badges, age_range, material, condition, color_options, color_images, description, benefits, dimensions, expert_note, image, image_position)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, slug, b.name.trim(), b.category || '', Number(b.price) || 0, b.installments || 'à vista',
        Number(b.rating) || 5, Number(b.reviewsCount) || 0, JSON.stringify(b.badges || []), b.ageRange || '',
        b.material || '', JSON.stringify(b.condition || []), JSON.stringify(b.colorOptions || []),
        JSON.stringify(b.colorImages || {}), b.description || '', JSON.stringify(b.benefits || []),
        b.dimensions || '', b.expertNote || '', b.image || '', b.imagePosition || '',
      ],
    })
    return res.status(201).json({ id })
  }

  if (req.method === 'PUT') {
    const b = req.body || {}
    if (!b.id) return res.status(400).json({ error: 'Id é obrigatório.' })
    if (!b.name?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' })

    const existing = await db.execute({ sql: 'SELECT slug FROM crm_products WHERE id = ?', args: [b.id] })
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado.' })

    const slug = b.slug && slugify(b.slug) !== existing.rows[0].slug
      ? await uniqueSlug(db, b.slug, b.id)
      : existing.rows[0].slug

    await db.execute({
      sql: `UPDATE crm_products SET
        slug = ?, name = ?, category = ?, price = ?, installments = ?, rating = ?, reviews_count = ?,
        badges = ?, age_range = ?, material = ?, condition = ?, color_options = ?, color_images = ?,
        description = ?, benefits = ?, dimensions = ?, expert_note = ?, image = ?, image_position = ?,
        updated_at = datetime('now')
        WHERE id = ?`,
      args: [
        slug, b.name.trim(), b.category || '', Number(b.price) || 0, b.installments || 'à vista',
        Number(b.rating) || 5, Number(b.reviewsCount) || 0, JSON.stringify(b.badges || []), b.ageRange || '',
        b.material || '', JSON.stringify(b.condition || []), JSON.stringify(b.colorOptions || []),
        JSON.stringify(b.colorImages || {}), b.description || '', JSON.stringify(b.benefits || []),
        b.dimensions || '', b.expertNote || '', b.image || '', b.imagePosition || '',
        b.id,
      ],
    })
    return res.json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Id é obrigatório.' })
    await db.execute({ sql: 'DELETE FROM crm_products WHERE id = ?', args: [id] })
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Método não permitido.' })
}

import { getDb } from '../lib/db.js'

export function rowToProduct(r) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    price: r.price,
    installments: r.installments,
    rating: r.rating,
    reviewsCount: r.reviews_count,
    badges: JSON.parse(r.badges || '[]'),
    ageRange: r.age_range,
    material: r.material,
    condition: JSON.parse(r.condition || '[]'),
    colorOptions: JSON.parse(r.color_options || '[]'),
    colorImages: JSON.parse(r.color_images || '{}'),
    description: r.description,
    benefits: JSON.parse(r.benefits || '[]'),
    dimensions: r.dimensions,
    expertNote: r.expert_note,
    image: r.image,
    imagePosition: r.image_position || undefined,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' })

  const db = await getDb()
  const result = await db.execute('SELECT * FROM crm_products ORDER BY created_at ASC')
  return res.json({ products: result.rows.map(rowToProduct) })
}

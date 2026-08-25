import { getFinanceSettings, setFinanceSettings } from '../lib/db.js'
import { requireAdmin } from '../lib/auth.js'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    const settings = await getFinanceSettings()
    return res.json({ settings })
  }

  if (req.method === 'PUT') {
    const settings = await setFinanceSettings(req.body || {})
    return res.json({ settings })
  }

  res.status(405).json({ error: 'Método não permitido.' })
}

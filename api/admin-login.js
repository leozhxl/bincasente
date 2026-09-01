import { signAdminToken } from '../lib/auth.js'
import { withErrorHandler } from '../lib/withErrorHandler.js'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD não configurada no servidor.' })
  }

  const { password } = req.body || {}
  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Senha incorreta.' })
  }

  const token = signAdminToken()
  res.json({ token })
}

export default withErrorHandler(handler)

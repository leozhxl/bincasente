import { handleUpload } from '@vercel/blob/client'
import { withErrorHandler } from '../lib/withErrorHandler.js'
import { requireAdmin } from '../lib/auth.js'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })
  if (!requireAdmin(req, res)) return

  const body = req.body

  const jsonResponse = await handleUpload({
    body,
    request: req,
    onBeforeGenerateToken: async (pathname, clientPayload) => {
      return {
        allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'],
        maximumSizeInBytes: 100 * 1024 * 1024,
        addRandomSuffix: true,
        tokenPayload: clientPayload,
      }
    },
    onUploadCompleted: async () => {},
  })

  return res.json(jsonResponse)
}

export default withErrorHandler(handler)

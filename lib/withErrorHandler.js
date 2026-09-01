export function withErrorHandler(handler) {
  return async function wrapped(req, res) {
    try {
      return await handler(req, res)
    } catch (err) {
      console.error(err)
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'Erro interno do servidor.' })
      }
    }
  }
}

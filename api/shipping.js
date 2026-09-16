const DEFAULT_PACKAGE = {
  width: 16,
  height: 8,
  length: 16,
  weight: 0.3, // kg por unidade, estimativa para produtos sensoriais pequenos
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  const token = process.env.MELHOR_ENVIO_TOKEN
  const fromCep = process.env.MELHOR_ENVIO_FROM_CEP
  const baseUrl = process.env.MELHOR_ENVIO_BASE_URL || 'https://melhorenvio.com.br'
  const contactEmail = process.env.MELHOR_ENVIO_CONTACT_EMAIL || 'contato@brincaesente.com.br'

  if (!token || !fromCep) {
    return res.status(503).json({ error: 'Cálculo de frete indisponível no momento.' })
  }

  const { cepDestino, quantity = 1 } = req.body || {}
  const cleanCep = String(cepDestino || '').replace(/\D/g, '')
  if (cleanCep.length !== 8) {
    return res.status(400).json({ error: 'CEP inválido.' })
  }

  const qty = Math.max(1, Number(quantity) || 1)

  try {
    const response = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': `Brinca e Sente (${contactEmail})`,
      },
      body: JSON.stringify({
        from: { postal_code: fromCep },
        to: { postal_code: cleanCep },
        products: [
          {
            id: '1',
            width: DEFAULT_PACKAGE.width,
            height: DEFAULT_PACKAGE.height,
            length: DEFAULT_PACKAGE.length,
            weight: DEFAULT_PACKAGE.weight,
            insurance_value: 0,
            quantity: qty,
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(502).json({ error: data?.message || 'Não foi possível calcular o frete.' })
    }

    const options = (Array.isArray(data) ? data : [])
      .filter((o) => !o.error && o.price)
      .map((o) => ({
        id: o.id,
        carrier: o.company?.name || 'Transportadora',
        service: o.name,
        price: Number(o.price),
        days: o.delivery_time,
      }))
      .sort((a, b) => a.price - b.price)

    if (options.length === 0) {
      return res.status(502).json({ error: 'Nenhuma opção de frete encontrada para esse CEP.' })
    }

    return res.json({ options })
  } catch {
    return res.status(502).json({ error: 'Erro ao consultar o frete. Tente novamente.' })
  }
}

const COMPANY_WHATSAPP = '5548991542845'

export function sendOrderToWhatsApp({ orderNumber, customer, items, total, paymentMethod }) {
  const address = `${customer.endereco}, ${customer.numero || 's/n'} - ${customer.cidade}/${customer.estado}, CEP ${customer.cep}`

  const itemsText = items
    .map((item, i) => {
      const features = item.benefits?.length ? `\n   Características: ${item.benefits.join(', ')}` : ''
      const color = item.color && item.color !== 'Padrão' ? ` (${item.color})` : ''
      return `${i + 1}. ${item.name}${color}
   Valor: R$ ${item.price.toFixed(2).replace('.', ',')}
   Quantidade: ${item.qty}${features}`
    })
    .join('\n\n')

  const header =
    paymentMethod === 'cartao'
      ? `🔗 Solicitação de link de pagamento (cartão) — Pedido ${orderNumber}`
      : `✅ Pagamento aprovado — Pedido ${orderNumber}`

  const footer =
    paymentMethod === 'cartao'
      ? '\n\nO cliente escolheu pagar no cartão. Por favor, envie um link de pagamento para ele.'
      : ''

  const message = `${header}

Cliente: ${customer.nome}
Telefone: ${customer.telefone || 'não informado'}

Produtos:
${itemsText}

Total: R$ ${total.toFixed(2).replace('.', ',')}

Endereço de entrega: ${address}${footer}`

  const url = `https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

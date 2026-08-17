export function openReceipt({ orderNumber, date, customer, items, subtotal, shipping, total, payment }) {
  const win = window.open('', '_blank', 'width=680,height=800')
  if (!win) return

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td style="text-align:center">${item.qty}</td>
          <td style="text-align:right">R$ ${item.price.toFixed(2).replace('.', ',')}</td>
          <td style="text-align:right">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</td>
        </tr>`
    )
    .join('')

  win.document.write(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Comprovante ${escapeHtml(orderNumber)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1c3b5a; max-width: 640px; margin: 32px auto; padding: 0 24px; }
  h1 { font-size: 1.3rem; margin: 0 0 4px; }
  .muted { color: #5b6b7a; font-size: 0.85rem; }
  .box { border: 1px solid #d7e3ea; border-radius: 8px; padding: 16px; margin: 16px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 8px 4px; border-bottom: 1px solid #e5edf1; font-size: 0.9rem; text-align: left; }
  .totals { margin-top: 12px; width: 100%; }
  .totals td { border: none; padding: 4px; }
  .totals .grand { font-weight: 700; font-size: 1.05rem; }
  .notice { margin-top: 24px; font-size: 0.78rem; color: #8a97a3; border-top: 1px dashed #d7e3ea; padding-top: 12px; }
  .print-btn { margin-top: 16px; padding: 10px 18px; border: none; border-radius: 999px; background: #ff8a3d; color: #fff; font-weight: 700; cursor: pointer; }
  @media print { .print-btn { display: none; } }
</style>
</head>
<body>
  <h1>Brinca &amp; Sente</h1>
  <p class="muted">Comprovante de compra — não é documento fiscal (NF-e)</p>

  <div class="box">
    <p><strong>Pedido:</strong> ${escapeHtml(orderNumber)}</p>
    <p><strong>Data:</strong> ${escapeHtml(date)}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(customer.nome)}</p>
    ${customer.cpfCnpj ? `<p><strong>CPF/CNPJ:</strong> ${escapeHtml(customer.cpfCnpj)}</p>` : ''}
    <p><strong>E-mail:</strong> ${escapeHtml(customer.email)}</p>
    <p><strong>Endereço:</strong> ${escapeHtml(customer.endereco)}, ${escapeHtml(customer.numero || 's/n')} — ${escapeHtml(customer.cidade)}/${escapeHtml(customer.estado)}, CEP ${escapeHtml(customer.cep)}</p>
    <p><strong>Forma de pagamento:</strong> ${escapeHtml(payment)}</p>
  </div>

  <table>
    <thead>
      <tr><th>Produto</th><th style="text-align:center">Qtd.</th><th style="text-align:right">Unit.</th><th style="text-align:right">Subtotal</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <table class="totals">
    <tr><td>Subtotal</td><td style="text-align:right">R$ ${subtotal.toFixed(2).replace('.', ',')}</td></tr>
    <tr><td>Frete</td><td style="text-align:right">R$ ${shipping.toFixed(2).replace('.', ',')}</td></tr>
    <tr class="grand"><td>Total</td><td style="text-align:right">R$ ${total.toFixed(2).replace('.', ',')}</td></tr>
  </table>

  <p class="notice">
    Este comprovante confirma o registro do seu pedido na Brinca &amp; Sente e não substitui a Nota Fiscal
    Eletrônica (NF-e). A NF-e, quando disponível, será enviada por e-mail separadamente.
  </p>

  <button class="print-btn" onclick="window.print()">Salvar / imprimir como PDF</button>
</body>
</html>`)
  win.document.close()
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]))
}

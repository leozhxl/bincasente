// Cálculo de frete por região, usando o CEP informado no checkout.
// Não é uma cotação real de transportadora — é uma tabela de preços por
// região que você mesmo define, mas calculada automaticamente a partir do
// estado do cliente (via ViaCEP), em vez de um valor fixo pra todo mundo.

// Estado de onde os pedidos são enviados. Ajuste se mudar a origem.
const ORIGIN_UF = 'SP'

// Preço e prazo por "faixa" de destino. Ajuste os valores conforme sua
// realidade (correios, transportadora, etc).
const RATES = {
  local: { price: 12, days: '2 a 4 dias úteis' }, // mesmo estado da origem
  sudeste: { price: 22, days: '4 a 6 dias úteis' }, // demais estados do Sudeste
  outros: { price: 32, days: '6 a 10 dias úteis' }, // resto do Brasil
}

const SUDESTE = ['SP', 'RJ', 'MG', 'ES']

function regionFor(uf) {
  if (uf === ORIGIN_UF) return 'local'
  if (SUDESTE.includes(uf)) return 'sudeste'
  return 'outros'
}

// Busca o endereço/UF pelo CEP na ViaCEP (gratuita, sem chave de API) e
// devolve o valor e prazo de frete para aquele destino.
export async function calcShippingByCep(cepRaw) {
  const cep = String(cepRaw || '').replace(/\D/g, '')
  if (cep.length !== 8) {
    throw new Error('CEP inválido.')
  }

  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
  if (!res.ok) throw new Error('Não foi possível consultar o CEP agora.')
  const data = await res.json()
  if (data.erro) throw new Error('CEP não encontrado.')

  const region = regionFor(data.uf)
  const rate = RATES[region]

  return {
    price: rate.price,
    days: rate.days,
    uf: data.uf,
    cidade: data.localidade,
    endereco: data.logradouro,
    bairro: data.bairro,
  }
}

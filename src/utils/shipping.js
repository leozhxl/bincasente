// Cálculo de frete: tenta primeiro uma cotação real via Melhor Envio
// (Correios/transportadoras, configurado em api/shipping.js). Se a API não
// estiver disponível (sem token configurado, fora do ar, etc.), cai numa
// tabela de preços fixos por região, calculada a partir do CEP via ViaCEP.

import { api } from '../api'

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
export async function calcShippingByCep(cepRaw, quantity = 1) {
  const cep = String(cepRaw || '').replace(/\D/g, '')
  if (cep.length !== 8) {
    throw new Error('CEP inválido.')
  }

  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
  if (!res.ok) throw new Error('Não foi possível consultar o CEP agora.')
  const data = await res.json()
  if (data.erro) throw new Error('CEP não encontrado.')

  const address = {
    uf: data.uf,
    cidade: data.localidade,
    endereco: data.logradouro,
    bairro: data.bairro,
  }

  try {
    const real = await api('/shipping', { method: 'POST', body: { cepDestino: cep, quantity } })
    const cheapest = real.options[0]
    return { price: cheapest.price, days: `${cheapest.days} dias úteis (${cheapest.carrier} · ${cheapest.service})`, ...address }
  } catch {
    const region = regionFor(data.uf)
    const rate = RATES[region]
    return { price: rate.price, days: rate.days, ...address }
  }
}

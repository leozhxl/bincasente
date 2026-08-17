const TOKEN_KEY = 'bes_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    // resposta sem corpo
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Não foi possível concluir a operação.')
  }

  return data
}

export async function calculateShipping(cep, quantity = 1) {
  const data = await api('/shipping', { method: 'POST', body: { cepDestino: cep, quantity } })
  return data.options[0]
}

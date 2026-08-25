const ADMIN_TOKEN_KEY = 'bes_admin_token'

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token)
  else localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export async function adminApi(path, { method = 'GET', body } = {}) {
  const token = getAdminToken()
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || 'Não foi possível concluir a operação.')
  return data
}

export function formatMoney(value) {
  return `R$ ${(value ?? 0).toFixed(2).replace('.', ',')}`
}

export function formatPct(value) {
  if (value == null) return null
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

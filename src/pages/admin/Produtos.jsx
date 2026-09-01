import { useEffect, useMemo, useState } from 'react'
import { adminApi, formatMoney } from './adminApi'
import { useProducts } from '../../context/ProductsContext'

const emptyForm = {
  id: null,
  name: '',
  category: '',
  price: '',
  installments: 'à vista',
  rating: 5,
  reviewsCount: 0,
  ageRange: '',
  material: 'PLA atóxico impresso em 3D',
  dimensions: '',
  description: '',
  expertNote: '',
  benefits: '',
  colorOptions: '',
  condition: [],
  badges: [],
  image: '',
}

function compressImage(file, maxSize = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export default function Produtos() {
  const { categories, conditions, refetch: refetchStorefront } = useProducts()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi('/admin-products')
      setProducts(data.products)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((p) => {
      if (categoryFilter !== 'todas' && p.category !== categoryFilter) return false
      if (!term) return true
      return p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term)
    })
  }, [products, search, categoryFilter])

  function openCreate() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(p) {
    setEditing(p)
    setShowForm(true)
  }

  async function handleSave(form) {
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      rating: Number(form.rating) || 5,
      reviewsCount: Number(form.reviewsCount) || 0,
      benefits: form.benefits.split(',').map((s) => s.trim()).filter(Boolean),
      colorOptions: form.colorOptions.split(',').map((s) => s.trim()).filter(Boolean),
    }
    if (form.id) {
      await adminApi('/admin-products', { method: 'PUT', body: payload })
    } else {
      await adminApi('/admin-products', { method: 'POST', body: payload })
    }
    await load()
    refetchStorefront()
  }

  async function handleDelete(p) {
    const confirmed = window.confirm(`Remover "${p.name}" do catálogo? Essa ação não pode ser desfeita.`)
    if (!confirmed) return
    await adminApi('/admin-products', { method: 'DELETE', body: { id: p.id } })
    await load()
    refetchStorefront()
  }

  return (
    <div className="crm-page">
      <div className="crm-page-head">
        <div>
          <h2>Produtos</h2>
          <p>{products.length} produto{products.length === 1 ? '' : 's'} no catálogo</p>
        </div>
        <button type="button" className="btn btn-accent" onClick={openCreate}>+ Novo Produto</button>
      </div>

      <div className="crm-toolbar">
        <div className="crm-search-wrap">
          <span className="crm-search-icon" aria-hidden="true">⌕</span>
          <input type="text" placeholder="Buscar produto, categoria..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="todas">Todas as categorias</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="crm-panel crm-list-panel">
        {loading ? (
          <p className="crm-loading">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="crm-empty-block">
            <span className="crm-empty-icon" aria-hidden="true">◧</span>
            <strong>Nenhum produto encontrado</strong>
            <p>Tente ajustar a busca ou o filtro de categoria.</p>
          </div>
        ) : (
          <ul className="crm-product-grid">
            {filtered.map((p) => (
              <li key={p.id} className="crm-product-card">
                <img src={p.image} alt="" loading="lazy" />
                <div>
                  <strong>{p.name}</strong>
                  <span className="crm-mini-sub">{categories.find((c) => c.slug === p.category)?.name || p.category}</span>
                  <span className="crm-product-price">{formatMoney(p.price)}</span>
                </div>
                <div className="crm-product-card-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Editar</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <ProdutoFormModal
          categories={categories}
          conditions={conditions}
          product={editing}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function ProdutoFormModal({ categories, conditions, product, onClose, onSave }) {
  const [form, setForm] = useState(() =>
    product
      ? {
          id: product.id,
          name: product.name,
          category: product.category,
          price: String(product.price),
          installments: product.installments,
          rating: product.rating,
          reviewsCount: product.reviewsCount,
          ageRange: product.ageRange,
          material: product.material,
          dimensions: product.dimensions,
          description: product.description,
          expertNote: product.expertNote,
          benefits: (product.benefits || []).join(', '),
          colorOptions: (product.colorOptions || []).join(', '),
          condition: product.condition || [],
          badges: product.badges || [],
          image: product.image || '',
        }
      : emptyForm
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageLoading, setImageLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleListValue(field, value) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }))
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageLoading(true)
    try {
      const dataUrl = await compressImage(file)
      update('image', dataUrl)
    } catch {
      setError('Não foi possível carregar essa imagem.')
    } finally {
      setImageLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Informe o nome do produto.')
      return
    }
    if (!form.category) {
      setError('Selecione uma categoria.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <form className="crm-modal crm-modal-lg" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <header className="crm-modal-header">
          <h2>{product ? 'Editar produto' : 'Novo produto'}</h2>
          <p className="field-hint">Preencha as informações abaixo para {product ? 'atualizar o' : 'publicar um novo'} item no catálogo.</p>
        </header>

        <div className="crm-modal-body">
          <section className="crm-form-section">
            <h3>Foto do produto</h3>
            <div className="crm-image-upload">
              {form.image ? (
                <img src={form.image} alt="" className="crm-image-preview" />
              ) : (
                <div className="crm-image-preview crm-image-placeholder" aria-hidden="true">◧</div>
              )}
              <div>
                <label className="btn btn-outline btn-sm">
                  {imageLoading ? 'Carregando...' : form.image ? 'Trocar foto' : 'Enviar foto'}
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </label>
                <p className="field-hint">JPG ou PNG. A imagem é redimensionada automaticamente.</p>
              </div>
            </div>
          </section>

          <section className="crm-form-section">
            <h3>Informações básicas</h3>
            <div className="crm-field-grid">
              <div className="field">
                <label htmlFor="p-name">Nome</label>
                <input id="p-name" type="text" value={form.name} onChange={(e) => update('name', e.target.value)} autoFocus />
              </div>
              <div className="field">
                <label htmlFor="p-category">Categoria</label>
                <select id="p-category" value={form.category} onChange={(e) => update('category', e.target.value)}>
                  <option value="">Selecione...</option>
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="p-price">Preço (R$)</label>
                <input id="p-price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="p-installments">Parcelamento / condição de pagamento</label>
                <input id="p-installments" type="text" value={form.installments} onChange={(e) => update('installments', e.target.value)} placeholder="Ex.: à vista, 2x de R$ 34,95" />
              </div>
              <div className="field">
                <label htmlFor="p-age">Faixa etária</label>
                <input id="p-age" type="text" value={form.ageRange} onChange={(e) => update('ageRange', e.target.value)} placeholder="Ex.: 3+ anos" />
              </div>
              <div className="field">
                <label htmlFor="p-dimensions">Dimensões</label>
                <input id="p-dimensions" type="text" value={form.dimensions} onChange={(e) => update('dimensions', e.target.value)} />
              </div>
              <div className="field crm-field-full">
                <label htmlFor="p-material">Material</label>
                <input id="p-material" type="text" value={form.material} onChange={(e) => update('material', e.target.value)} />
              </div>
            </div>
          </section>

          <section className="crm-form-section">
            <h3>Conteúdo e descrição</h3>
            <div className="field">
              <label htmlFor="p-description">Descrição</label>
              <textarea id="p-description" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
            </div>
            <div className="crm-field-grid">
              <div className="field">
                <label htmlFor="p-benefits">Benefícios (separados por vírgula)</label>
                <input id="p-benefits" type="text" value={form.benefits} onChange={(e) => update('benefits', e.target.value)} placeholder="Ex.: Atóxico, Leve, Giro suave" />
              </div>
              <div className="field">
                <label htmlFor="p-colors">Opções de cor (separadas por vírgula)</label>
                <input id="p-colors" type="text" value={form.colorOptions} onChange={(e) => update('colorOptions', e.target.value)} placeholder="Ex.: Rosa, Azul, Roxo" />
              </div>
              <div className="field crm-field-full">
                <label htmlFor="p-expert">Nota de especialista</label>
                <input id="p-expert" type="text" value={form.expertNote} onChange={(e) => update('expertNote', e.target.value)} />
              </div>
            </div>
          </section>

          <section className="crm-form-section">
            <h3>Avaliação e destaque</h3>
            <div className="crm-field-grid">
              <div className="field">
                <label htmlFor="p-rating">Avaliação (0 a 5)</label>
                <input id="p-rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => update('rating', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="p-reviews">Nº de avaliações</label>
                <input id="p-reviews" type="number" min="0" value={form.reviewsCount} onChange={(e) => update('reviewsCount', e.target.value)} />
              </div>
            </div>

            <div className="field">
              <span className="field-label">Selos</span>
              <div className="crm-checkbox-row">
                {[
                  { value: 'new', label: 'Novo' },
                  { value: 'best', label: 'Mais vendido' },
                  { value: 'expert', label: 'Recomendado por terapeutas' },
                ].map((b) => (
                  <label key={b.value} className="crm-checkbox">
                    <input type="checkbox" checked={form.badges.includes(b.value)} onChange={() => toggleListValue('badges', b.value)} />
                    {b.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="field-label">Condições atendidas</span>
              <div className="crm-checkbox-row">
                {conditions.map((c) => (
                  <label key={c.slug} className="crm-checkbox">
                    <input type="checkbox" checked={form.condition.includes(c.slug)} onChange={() => toggleListValue('condition', c.slug)} />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {error && <p className="field-error">{error}</p>}
        </div>

        <div className="crm-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-accent" disabled={saving || imageLoading}>
            {saving ? 'Salvando...' : product ? 'Salvar alterações' : 'Cadastrar produto'}
          </button>
        </div>
      </form>
    </div>
  )
}

import express from 'express'
import cors from 'cors'
import authHandler from '../api/auth.js'
import meHandler from '../api/me.js'
import ordersHandler from '../api/orders.js'
import adminOrdersHandler from '../api/admin-orders.js'
import adminSettingsHandler from '../api/admin-settings.js'
import adminCustomersHandler from '../api/admin-customers.js'
import adminDealsHandler from '../api/admin-deals.js'
import productsHandler from '../api/products.js'
import adminProductsHandler from '../api/admin-products.js'
import createPixOrderHandler from '../api/create-pix-order.js'
import mercadoPagoWebhookHandler from '../api/mercadopago-webhook.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '8mb' }))

app.post('/api/auth', authHandler)
app.all('/api/me', meHandler)
app.all('/api/orders', ordersHandler)
app.all('/api/admin-orders', adminOrdersHandler)
app.all('/api/admin-settings', adminSettingsHandler)
app.all('/api/admin-customers', adminCustomersHandler)
app.all('/api/admin-deals', adminDealsHandler)
app.all('/api/products', productsHandler)
app.all('/api/admin-products', adminProductsHandler)
app.post('/api/create-pix-order', createPixOrderHandler)
app.all('/api/mercadopago-webhook', mercadoPagoWebhookHandler)

app.listen(PORT, () => {
  console.log(`Brinca e Sente API rodando em http://localhost:${PORT}`)
})

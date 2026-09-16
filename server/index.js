import express from 'express'
import cors from 'cors'
import registerHandler from '../api/register.js'
import loginHandler from '../api/login.js'
import meHandler from '../api/me.js'
import ordersHandler from '../api/orders.js'
import adminLoginHandler from '../api/admin-login.js'
import adminOrdersHandler from '../api/admin-orders.js'
import adminSettingsHandler from '../api/admin-settings.js'
import adminCustomersHandler from '../api/admin-customers.js'
import adminDealsHandler from '../api/admin-deals.js'
import productsHandler from '../api/products.js'
import adminProductsHandler from '../api/admin-products.js'
import shippingHandler from '../api/shipping.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '8mb' }))

app.post('/api/register', registerHandler)
app.post('/api/login', loginHandler)
app.all('/api/me', meHandler)
app.all('/api/orders', ordersHandler)
app.post('/api/admin-login', adminLoginHandler)
app.all('/api/admin-orders', adminOrdersHandler)
app.all('/api/admin-settings', adminSettingsHandler)
app.all('/api/admin-customers', adminCustomersHandler)
app.all('/api/admin-deals', adminDealsHandler)
app.all('/api/products', productsHandler)
app.all('/api/admin-products', adminProductsHandler)
app.post('/api/shipping', shippingHandler)

app.listen(PORT, () => {
  console.log(`Brinca e Sente API rodando em http://localhost:${PORT}`)
})

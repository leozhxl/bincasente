import express from 'express'
import cors from 'cors'
import registerHandler from '../api/register.js'
import loginHandler from '../api/login.js'
import meHandler from '../api/me.js'
import ordersHandler from '../api/orders.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.post('/api/register', registerHandler)
app.post('/api/login', loginHandler)
app.all('/api/me', meHandler)
app.all('/api/orders', ordersHandler)

app.listen(PORT, () => {
  console.log(`Brinca e Sente API rodando em http://localhost:${PORT}`)
})

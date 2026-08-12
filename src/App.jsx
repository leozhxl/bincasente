import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AccessibilityProvider } from './context/AccessibilityContext'
import { AuthProvider } from './context/AuthContext'
import { OrdersProvider } from './context/OrdersContext'
import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'

import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Account from './pages/Account'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import AccessibilityPage from './pages/AccessibilityPage'
import ExchangePolicy from './pages/ExchangePolicy'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <OrdersProvider>
          <CartProvider>
            <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>
            <Header />
            <main id="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/loja" element={<Catalog />} />
                <Route path="/loja/:categorySlug" element={<Catalog />} />
                <Route path="/produto/:slug" element={<Product />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/conta" element={<Account />} />
                <Route path="/sobre" element={<About />} />
                <Route path="/como-funciona" element={<HowItWorks />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/acessibilidade" element={<AccessibilityPage />} />
                <Route path="/politica-trocas" element={<ExchangePolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <WhatsAppButton />
          </CartProvider>
        </OrdersProvider>
      </AuthProvider>
    </AccessibilityProvider>
  )
}

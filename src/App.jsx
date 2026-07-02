import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ConfigError } from './components/ConfigError'
import { Home } from './pages/Home'
import { Properties } from './pages/Properties'
import { PropertyDetail } from './pages/PropertyDetail'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import './App.css'

const hasSupabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

function App() {
  if (!hasSupabaseConfig) {
    return <ConfigError />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

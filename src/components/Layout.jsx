// Purpose: Wrap routes in the shared navbar and footer shell.
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import '../styles/Layout.css'

export function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

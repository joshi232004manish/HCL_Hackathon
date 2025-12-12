import Header from './Header.jsx'
import Footer from './Footer.jsx'

function Layout({ children }) {
  return (
    <div className="page">
      <Header />
      <main className="content">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout


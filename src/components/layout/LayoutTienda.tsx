import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

export default function LayoutTienda({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import FaviconGenerator from '@/pages/FaviconGenerator'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<FaviconGenerator />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

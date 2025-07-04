import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'
import DentalERPDemo from './DentalERPDemo.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DentalERPDemo />
  </StrictMode>,
)

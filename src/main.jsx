import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

const baseUrl = import.meta.env.BASE_URL
document.documentElement.style.setProperty(
  '--CC__hero-image',
  `url('${baseUrl}hero-image.png')`,
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

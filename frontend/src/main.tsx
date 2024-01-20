import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App/App.tsx'
import './index.css'


export const backEndUrl = "http://localhost:3000"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
)

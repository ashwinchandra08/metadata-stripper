import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const isDev = import.meta.env.MODE === 'development';

ReactDOM.createRoot(document.getElementById('root')).render(
  isDev ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
)
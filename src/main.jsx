import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import { isSupabaseConfigured } from './supabaseClient'
import '@/index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

if (isSupabaseConfigured) {
  root.render(<App />)
} else {
  root.render(
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
      <section className="max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-xl font-semibold">Falta configurar Supabase</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          Crea un archivo <code className="text-white">.env.local</code> en la
          carpeta del proyecto y agrega la URL del proyecto y su clave anon o
          publishable de Supabase. Puedes encontrar ambas en Supabase, en
          Project Settings → API Keys.
        </p>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Usa los nombres <code>VITE_SUPABASE_URL</code> y{' '}
          <code>VITE_SUPABASE_ANON_KEY</code>, y reinicia el servidor con{' '}
          <code>npm run dev</code>.
        </p>
      </section>
    </main>
  )
}

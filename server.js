import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// Middleware
app.use(express.json({ limit: '50mb' }))

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')))

// API proxy for Anthropic
app.post('/api/anthropic', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY not configured on server',
    })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    res.json(data)
  } catch (error) {
    console.error('API proxy error:', error)
    res.status(500).json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : String(error),
    })
  }
})

// Serve SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

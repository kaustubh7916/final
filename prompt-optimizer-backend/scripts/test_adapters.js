'use strict'

require('dotenv').config()

const gemini = require('../llm_adapters/gemini')
const hf = require('../llm_adapters/hf_inference')

async function run() {
  const prompt = process.argv.slice(2).join(' ') || 'Summarize: Prompt optimization reduces tokens while preserving meaning.'

  console.log('--- LLM Integration Test ---')
  console.log('Prompt:', prompt)
  console.log('USE_MOCK_LLM =', process.env.USE_MOCK_LLM)

  const results = []

  try {
    const r = await gemini.callAdapter(prompt, { temperature: 0.7, max_tokens: 256 })
    results.push(['gemini', r])
  } catch (e) {
    results.push(['gemini', { ok: false, error: e.message }])
  }

  try {
    const r = await hf.callAdapter(prompt, { temperature: 0.7, max_tokens: 256 })
    results.push(['hf_inference', r])
  } catch (e) {
    results.push(['hf_inference', { ok: false, error: e.message }])
  }

  for (const [name, r] of results) {
    console.log(`\n[${name}]`)
    if (r.ok) {
      console.log('ok: true')
      console.log('latencyMs:', r.latencyMs)
      console.log('tokens:', r.tokens)
      console.log('text preview:', (r.text || '').slice(0, 120))
    } else {
      console.log('ok: false')
      console.log('error:', r.error || (r.raw && r.raw.error))
    }
  }
}

run().catch(err => {
  console.error('Test runner error:', err)
  process.exit(1)
})



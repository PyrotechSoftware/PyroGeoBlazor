import { build } from 'vite'

// This ESM wrapper avoids using the CJS Node API which is deprecated for Vite
;(async () => {
  try {
    await build()
    console.log('Vite build finished')
  } catch (e) {
    console.error('Vite build failed', e)
    process.exit(1)
  }
})()

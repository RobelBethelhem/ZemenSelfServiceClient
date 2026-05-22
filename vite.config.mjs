import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { execSync } from 'node:child_process'
import autoprefixer from 'autoprefixer'

const safeGit = (cmd, fallback = 'unknown') => {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return fallback
  }
}

const GIT_BRANCH = safeGit('git rev-parse --abbrev-ref HEAD')
const GIT_COMMIT = safeGit('git rev-parse --short HEAD')
const BUILD_TIME = new Date().toISOString()

// Public-facing host. QR codes printed on letters must resolve from the
// open internet (where aps2.zemenbank.com is not reachable), so default to
// the public-facing zhr host. Override via VITE_VERIFY_URL_BASE if needed.
const VERIFY_URL_BASE =
  process.env.VITE_VERIFY_URL_BASE || 'https://zhr.zemenbank.com/zbss/#/verify'

export default defineConfig(() => {
  return {
    base: './',
    define: {
      __APP_BRANCH__: JSON.stringify(GIT_BRANCH),
      __APP_COMMIT__: JSON.stringify(GIT_COMMIT),
      __APP_BUILD_TIME__: JSON.stringify(BUILD_TIME),
      __VERIFY_URL_BASE__: JSON.stringify(VERIFY_URL_BASE),
    },
    build: {
      outDir: 'build',
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
      include: ['qrcode.react']
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      port: 4000,
      proxy: {
        // Source code now calls relative /zbss/api/... URLs. In dev, Vite
        // proxies anything starting with /zbss to the backend on aps2 so
        // those calls reach a real server. Production serves the SPA from
        // the same host that handles /zbss/api, so the relative path
        // resolves naturally without any rewrite.
        '/zbss': {
          target: 'https://aps2.zemenbank.com',
          changeOrigin: true,
          secure: false,
        },
        // https://vitejs.dev/config/server-options.html
      },
    },
  }
})

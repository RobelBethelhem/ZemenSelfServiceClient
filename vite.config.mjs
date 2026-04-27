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

const VERIFY_URL_BASE =
  process.env.VITE_VERIFY_URL_BASE || 'https://aps2.zemenbank.com/zbss/#/verify'

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
        '/api': {
          target: 'http://aps2.zemenbank.com/zmss',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\https://aps2.zemenbank.com/zbss/api/ '')
        },
        // https://vitejs.dev/config/server-options.html
      },
    },
  }
})

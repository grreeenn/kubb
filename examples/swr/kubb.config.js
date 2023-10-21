import { defineConfig } from '@kubb/core'
import createSwagger from '@kubb/swagger'
import createSwaggerSWR from '@kubb/swagger-swr'
import createSwaggerTS from '@kubb/swagger-ts'

export default defineConfig({
  root: '.',
  input: {
    path: './petStore.yaml',
  },
  output: {
    path: './src/gen',
    clean: true,
  },
  hooks: {
    done: ['prettier --write "**/*.{ts,tsx}"', 'eslint --fix ./src/gen'],
  },
  plugins: [createSwagger({ output: false }), createSwaggerTS({ output: 'models' }), createSwaggerSWR({ output: './hooks' })],
})

// SPDX-FileCopyrightText: 2024 Skatteverket - Swedish Tax Agency
//
// SPDX-License-Identifier: CC0-1.0

import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import commonjs from 'vite-plugin-commonjs'
import dts from 'vite-plugin-dts';

import path, { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
    commonjs(),
    dts()
  ],
  define: {'process.env': process.env},
  build: {
    copyPublicDir: false,
    target: "es2020",
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: "MlaWebComponent",
      fileName: "mla-component",
      formats: ["umd"]
    },
  },
  resolve: {
    alias:{
      'react-mla' : path.resolve(__dirname, '../react-mla/index.ts'),
    },
  },
})

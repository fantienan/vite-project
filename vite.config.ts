import { defineConfig } from 'vite'
import path from 'path';
import {theme} from 'antd'
import react from '@vitejs/plugin-react'
// import vitePluginImp from 'vite-plugin-imp'

const { defaultAlgorithm, defaultSeed } = theme;

const mapToken = defaultAlgorithm(defaultSeed);
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
  //  vitePluginImp({
  //     libList: [
  //       {
  //         libName: "antd",
  //         style: (name) => `antd/es/${name}/style`,
  //       },
  //     ],
  //   })
  ],
  resolve: {
    alias: [
      {find: /^~/, replacement: ''},
{find: '@ol', replacement: path.resolve(__dirname, 'node_modules/ol/')},
    ]
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
        },
      },
    }
  },
  server: {
    port: 3000,
host: '0.0.0.0',
  proxy: {
    "/csldt/ldt-service": {
      target: "http://10.10.2.33:8111",
    }
  }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { ViteFaviconsPlugin } from "vite-plugin-favicon";

// const ViteFaviconPlugin = require('vite-plugin-favicon')

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        // ViteFaviconsPlugin()
    ],
//   assetsInclude
})

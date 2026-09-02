import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  plugins: [
    {
      name: 'copy-static',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'libs/gaussian-splats-3d.umd.cjs',
          source: require('fs').readFileSync(resolve(__dirname, 'libs/gaussian-splats-3d.umd.cjs'))
        })
        this.emitFile({
          type: 'asset',
          fileName: 'models/oblique.glb',
          source: require('fs').readFileSync(resolve(__dirname, 'models/oblique.glb'))
        })
        this.emitFile({
          type: 'asset',
          fileName: 'models/Merged_modified.glb',
          source: require('fs').readFileSync(resolve(__dirname, 'models/Merged_modified.glb'))
        })
        this.emitFile({
          type: 'asset',
          fileName: 'models/splat.ply',
          source: require('fs').readFileSync(resolve(__dirname, 'models/splat.ply'))
        })
        this.emitFile({
          type: 'asset',
          fileName: 'models/splat2.ply',
          source: require('fs').readFileSync(resolve(__dirname, 'models/splat2.ply'))
        })
        this.emitFile({
          type: 'asset',
          fileName: 'models/test_model.mobile.compressed.ply',
          source: require('fs').readFileSync(resolve(__dirname, 'models/test_model.mobile.compressed.ply'))
        })
        this.emitFile({
          type: 'asset',
          fileName: 'highway.geojsonl.json',
          source: require('fs').readFileSync(resolve(__dirname, 'highway.geojsonl.json'))
        })
      }
    }
  ]
})

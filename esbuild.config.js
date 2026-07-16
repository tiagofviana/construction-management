import fs from 'fs'
import path from 'path'
import { fileURLToPath, URL } from 'url'
import esbuild from 'esbuild'
import unpluginVue from 'unplugin-vue/esbuild'

const isDevMode = process.argv.includes('--dev')

const outdirCleanerPlugin = {
    name: 'outdir-cleaner',
    setup({ onStart, initialOptions }) {
        onStart(function () {
            const dir = path.resolve(initialOptions.outdir)
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true, force: true })
                console.log('\x1b[35m%s\x1b[0m', `🧹 Cleaning: ${dir}`)
            }
        })
    },
}

const loggerPlugin = {
    name: 'logger',
    setup({ onStart, onEnd, initialOptions }) {
        let startTime
        onStart(function () {
            startTime = Date.now()
        })

        onEnd((result) => {
            const entryPoint = initialOptions.entryPoints[0]
            console.log('\n\x1b[36m%s\x1b[0m', entryPoint)

            if (result.warnings.length !== 0) {
                const warnings = JSON.stringify(result.warnings, null, 4)
                console.warn(`Warnings: ${warnings}`)
            }

            if (result.errors.length !== 0) {
                const erros = JSON.stringify(result.errors, null, 4)
                console.error(`Errors: ${erros}`)
                return
            }

            if (initialOptions.outfile) {
                const stat = fs.statSync(initialOptions.outfile)
                console.log('\x1b[34m%s\x1b[0m', `build finished: ${initialOptions.outfilet}`)
                console.log('\x1b[33m%s\x1b[0m', `Size: ${(stat.size / 1024).toFixed(1)} kb`)
            }

            const dirPath = initialOptions.outdir
            if (dirPath) {
                const files = fs.readdirSync(dirPath, {
                    withFileTypes: true,
                    recursive: true,
                })

                for (const item of files) {
                    const itemPath = path.resolve(item.parentPath, item.name)
                    const stat = fs.statSync(itemPath)
                    if (stat.isFile()) {
                        console.log('\x1b[34m%s\x1b[0m', `build finished: ${itemPath}`)
                        console.log(
                            '\x1b[33m%s\x1b[0m',
                            `Size: ${(stat.size / 1024).toFixed(1)} kb`,
                        )
                    }
                }
            }

            console.log('\x1b[32m%s\x1b[0m', `Done in ${Date.now() - startTime} ms`)
        })
    },
}

const defaultOption = {
    charset: 'utf8',
    tsconfig: '.\\tsconfig.json',
    bundle: true,
    minify: true,
    sourcemap: isDevMode,
    platform: 'browser',
    target: ['chrome90', 'firefox120'],
    format: 'esm',
    logLevel: 'silent',
    plugins: [
        loggerPlugin,
        outdirCleanerPlugin,
        unpluginVue({
            sourceMap: false,
        }),
    ],
    splitting: true,
    entryNames: '[dir]\\[name].min',
    chunkNames: 'chunks\\[name]-[hash].min',
    assetNames: 'assets\\[name]-[hash]',
    alias: {
        '@': fileURLToPath(new URL('.\\src\\front-end\\spa', import.meta.url)),
    },
    loader: {
        '.webp': 'file',
        '.png': 'file',
        '.jpg': 'file',
        '.svg': 'file',
        '.css': 'css',
    },
}

const entries = [
    // SPA
    {
        ...defaultOption,
        entryPoints: ['src\\front-end\\spa\\main.ts'],
        outdir: '.\\src\\back-end\\apps\\spa\\static\\spa\\_js\\index\\bundled\\',
        publicPath: '/static/spa/_js/index/bundled',
    },

    // MPA
    {
        ...defaultOption,
        entryPoints: ['src\\front-end\\mpa\\image\\cropper\\main.ts'],
        outdir: 'src\\back-end\\apps\\core\\static\\core\\_js\\widgets\\image_cropper\\bundled\\',
    },
]

entries.forEach(function (item) {
    esbuild.context(item).then((context) => {
        context.watch()
    })
})

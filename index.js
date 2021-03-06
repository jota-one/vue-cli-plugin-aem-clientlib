const ora = require('ora')
const path = require('path')
const chalk = require('chalk')
const zip = require('zip-dir')
const fs = require('fs-extra')
const replace = require('replace')
const { remove, mkdirp, copy, move } = require('fs-extra')
const { formatISO } = require('date-fns')

module.exports = function (api, options, rootOptions) {
  const resolvedOptions = Object.assign({}, {
    name: 'jota-webpack',
    template: 'build/aem-template',
    dest: 'build/distaem'
  }, options.pluginOptions && options.pluginOptions.buildaem ? options.pluginOptions.buildaem : {})

  async function aem (args, bundleOptions) {
    const spinner = ora('building for ' + args.mode + '...')
    spinner.start()

    const version = require(api.resolve('package.json')).version

    let suffix = ''
    if (args.snapshot) {
      suffix = bundleOptions.devBuildSuffix || ''
    }

    const bundleNameNoExt = bundleOptions.name + '-' + version + suffix
    const bundleName = bundleNameNoExt + '.zip'

    // remove previous dist directory
    await remove(api.resolve(bundleOptions.dest))

    // create fresh dist directory
    mkdirp(api.resolve(bundleOptions.dest))

    // copy template content
    await copy(api.resolve(bundleOptions.template), api.resolve(bundleOptions.dest))

    // rename the package name directory
    const insideAemPackagePath = `jcr_root${bundleOptions.aemPackageInternalPath}`
    const assetsAemSubDirectory = path.join(bundleOptions.dest, insideAemPackagePath, bundleOptions.name)
    await move(api.resolve(path.join(bundleOptions.dest, insideAemPackagePath, 'webpack-package-name')), api.resolve(assetsAemSubDirectory))

    // Update aem properties
    const now = formatISO(new Date(), { representation: 'complete' })
    const replacements = {
      __NAME__: bundleOptions.name,
      __VERSION__: `${version}${suffix}`,
      __LAST_MODIFIED__: now,
      __LAST_WRAPPED__: now,
      __AEM_GROUP__: bundleOptions.aemPackageGroup
    }
    Object.entries(replacements).map(([ key, value ]) => {
      replace({
        regex: key,
        replacement: value,
        paths: [api.resolve(bundleOptions.dest)],
        recursive: true,
        silent: true
      })
    })

    console.log(chalk.cyan(' copy webpack build...'))
    await fs.copy(options.outputDir, api.resolve(assetsAemSubDirectory))

    // generate js.txt and css.txt reference files
    const baseJs = '#base=js\napp.js'
    fs.writeFile(api.resolve(path.join(assetsAemSubDirectory, 'js.txt')), baseJs)

    let cssFiles = []
    let baseCss = '#base=css\n'
    let cssPath = [ 'css' ]
    let done = false
    if (options.css && options.css.extract && typeof options.css.extract === 'object' && options.css.extract.filename) {
      cssPath = options.css.extract.filename.split('/')
      cssFiles = [ cssPath.pop() ]
      if (cssPath.join('/') !== 'css') {
        baseCss = `#base=${cssPath.join('/')}\n`
      }
      done = true
    }

    if (!done && fs.existsSync(api.resolve(path.join(assetsAemSubDirectory, ...cssPath)))) {
      cssFiles = fs.readdirSync(api.resolve(path.join(assetsAemSubDirectory, ...cssPath)))
        .filter(file => file.slice(-4) === '.css')
    }

    if (cssFiles.length > 0) {
      fs.writeFile(api.resolve(path.join(assetsAemSubDirectory, 'css.txt')), baseCss + cssFiles.join('\n'))
    }

    spinner.start()

    if (bundleOptions.postAemBuildPath && fs.existsSync(api.resolve(bundleOptions.postAemBuildPath))) {
      await require(api.resolve(resolvedOptions.postAemBuildPath))(api, bundleOptions, args)
    }

    zip(api.resolve(bundleOptions.dest), { saveTo: api.resolve(path.join('build', bundleName)) }, err => {
      if (err) throw err

      spinner.stop()
      console.log(chalk.green('  Zip created and saved in /%s.'), path.join('build', bundleName))
    })
  }

  api.registerCommand('buildaem', {
    description: 'build the project for AEM crx',
    usage: 'vue-cli-service buildaem [options]',
    options: {
      '--mode': 'specify env mode (default: production)',
      '--dest': 'build in a specific directory (default: dist)',
      '--snapshot': 'append -SNAPSHOT to the generated zip name'
    }
  }, async function (args) {
    const defaultBuildArgs = {
      mode: 'production',
      dest: api.resolve('build/dist')
    }
    const defaultAemArgs = {
      snapshot: false
    }

    // optimize webpack build for an AEM deployment
    api.configureWebpack({
      optimization: {
        splitChunks: {
          chunks: 'async',
          maxInitialRequests: 1
        }
      },
      output: {
        // Avoid conflicts with other vue apps (e.g. chat)
        jsonpFunction: `${resolvedOptions.name}WebpackJsonp`,
        // Force filename without hash for A€M
        filename: 'js/app.js',
        // Force hash in chunks filename for AEM
        // to avoid risks due to long time TTL
        chunkFilename: 'js/[name].[hash:8].js'
      }
    })

    api.chainWebpack(config => {
      config.plugins.delete('prefetch')
    })

    // run pre build action, then build, then post build action
    if (resolvedOptions.preBuildPath && fs.existsSync(api.resolve(resolvedOptions.preBuildPath))) {
      await require(api.resolve(resolvedOptions.preBuildPath))(api, resolvedOptions)
    }
    await api.service.run('build', { ...defaultBuildArgs, ...args })

    let result = {}
    if (resolvedOptions.postBuildPath && fs.existsSync(api.resolve(resolvedOptions.postBuildPath))) {
      result = await require(api.resolve(resolvedOptions.postBuildPath))(api, resolvedOptions, { ...defaultBuildArgs, ...defaultAemArgs, ...args })
    }

    // run the AEM build
    try {
      return aem({ ...defaultBuildArgs, ...defaultAemArgs, ...args }, { ...resolvedOptions, ...result })
    } catch (e) {
      console.log('Error:', e.getMessage())
    }
  })
}

module.exports.defaultModes = {
  buildaem: 'production'
}

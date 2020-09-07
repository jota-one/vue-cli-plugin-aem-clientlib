const ora = require('ora')
const path = require('path')
const chalk = require('chalk')
const zip = require('zip-dir')
const fs = require('fs-extra')
const parseString = require('xml2js-es6-promise')
const xml2js = require('xml2js')
const moment = require('moment')

module.exports = function (api, options, rootOptions) {
  const resolvedOptions = Object.assign({}, {
    name: 'jota-webpack',
    template: 'build/aem-template',
    dest: 'build/distaem'
  }, options.pluginOptions && options.pluginOptions.buildaem ? options.pluginOptions.buildaem : {})
  const insideAemPackagePath = `jcr_root${resolvedOptions.aemPackageInternalPath}`
  const config = {
    assetsRoot: resolvedOptions.dest,
    aemTemplate: resolvedOptions.template,
    aemMetaPropertiesFile: 'META-INF/vault/properties.xml',
    assetsAemSubDirectory: path.join(insideAemPackagePath, resolvedOptions.name)
  }

  async function aem (args) {
    const spinner = ora('building for ' + args.mode + '...')
    spinner.start()

    const version = require(api.resolve('package.json')).version

    let suffix = ''
    if (args.snapshot) {
      suffix = resolvedOptions.devBuildSuffix || ''
    }


    const bundleNameNoExt = resolvedOptions.name + '-' + version + suffix
    const bundleName = bundleNameNoExt + '.zip'

    // remove previous dist directory
    await fs.remove(api.resolve(config.assetsRoot))

    // create fresh dist directory
    fs.mkdirp(api.resolve(config.assetsRoot))

    // copy template content
    await fs.copy(api.resolve(config.aemTemplate), api.resolve(config.assetsRoot))

    // rename the package name directory
    await fs.move(api.resolve(path.join(config.assetsRoot, insideAemPackagePath, 'webpack-package-name')), api.resolve(path.join(config.assetsRoot, insideAemPackagePath, resolvedOptions.name)))

    // update AEM package metadata
    const data = await fs.readFile(api.resolve(path.join(config.assetsRoot, config.aemMetaPropertiesFile)), 'utf-8')

    // we then pass the data to our method here
    const json = await parseString(data)

    // update data
    let now = moment().toISOString(true)
    json.properties.entry.find(entry => entry.$.key === 'lastModified')._ = now
    json.properties.entry.find(entry => entry.$.key === 'lastWrapped')._ = now
    json.properties.entry.find(entry => entry.$.key === 'version')._ = version + suffix

    // create a new builder object and then convert
    // our json back to xml.
    let builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'utf-8', standalone: false },
      doctype: { sysID: 'http://java.sun.com/dtd/properties.dtd' }
    })
    let xml = builder.buildObject(json)

    fs.writeFile(api.resolve(path.join(config.assetsRoot, config.aemMetaPropertiesFile)), xml)

    console.log(chalk.cyan(' copy webpack build...'))
    await fs.copy(options.outputDir, api.resolve(path.join(config.assetsRoot, config.assetsAemSubDirectory)))

    // generate js.txt and css.txt reference files
    let pathToJsFiles = api.resolve(path.join(config.assetsRoot, config.assetsAemSubDirectory))
    let pathToCssFiles = pathToJsFiles
    if (args.mode === 'production') {
      pathToJsFiles = path.join(pathToJsFiles, 'js')
      pathToCssFiles = path.join(pathToCssFiles, 'css')
    }
    const jsFiles = fs.readdirSync(pathToJsFiles).filter(file => file.slice(-3) === '.js')
    const cssFiles = fs.readdirSync(pathToCssFiles).filter(file => file.slice(-4) === '.css')

    const baseJs = args.mode === 'production' ? '#base=js\n' : '#base=.\n'
    const baseCss = args.mode === 'production' ? '#base=css\n' : '#base=.\n'

    fs.writeFile(api.resolve(path.join(config.assetsRoot, config.assetsAemSubDirectory, 'js.txt')), baseJs + jsFiles.join('\n'))
    fs.writeFile(api.resolve(path.join(config.assetsRoot, config.assetsAemSubDirectory, 'css.txt')), baseCss + cssFiles.join('\n'))

    spinner.start()

    zip(api.resolve(config.assetsRoot), { saveTo: api.resolve(path.join('build', bundleName)) }, err => {
      if (err) throw err

      spinner.stop()
      console.log(chalk.green('  Zip created and saved in /%s.'), bundleName)
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
    const defaultArgs = {
      mode: 'production',
      dest: 'dist'
    }

    // run pre build action, then build, then post build action
    if (resolvedOptions.preBuildPath && fs.existsSync(api.resolve(resolvedOptions.preBuildPath))) {
      await require(api.resolve(resolvedOptions.preBuildPath))(api)
    }
    await api.service.run('build', { dest: api.resolve('build/dist') })
    if (resolvedOptions.postBuildPath && fs.existsSync(api.resolve(resolvedOptions.postBuildPath))) {
      await require(api.resolve(resolvedOptions.postBuildPath))(api, api.resolve('build/dist'))
    }

    // run the AEM build
    try {
      return aem(Object.assign({}, defaultArgs, args))
    } catch (e) {
      console.log('Error:', e.getMessage())
    }
  })
}

module.exports.defaultModes = {
  buildaem: 'production'
}

const fs = require('fs')
const path = require('path')
module.exports = function (api, options) {
  // copy build template
  if (options.installTemplate) {
    api.render('./template', {
      ...options
    })
  }

  // add a NPM script to run the build
  api.extendPackage({
    scripts: {
      'build:review': 'vue-cli-service buildaem --mode development --snapshot=1',
      'build:prod': 'vue-cli-service buildaem'
    },
    vue: {
      pluginOptions: {
        buildaem: {
          name: options.projectName,
          mappings: [{
            src: 'dist',
            packagePath: path.join(options.aemPackageInternalPath, options.projectName)
          }],
          aemPackageGroup: options.aemPackageGroup,
          devBuildSuffix: options.devBuildSuffix,
          ...(options.preBuildPath ? { preBuildPath: options.preBuildPath } : {}),
          ...(options.postBuildPath ? { postBuildPath: options.postBuildPath } : {})
        }
      }
    }
  })

  // extend (or create) .gitignore file to ignore build directories
  api.onCreateComplete(async () => {
    const gitignorePath = api.resolve('.gitignore')
    let content

    if (fs.existsSync(gitignorePath)) {
      content = fs.readFileSync(gitignorePath, { encoding: 'utf8' })
    } else {
      content = ''
    }

    if (content.indexOf('/build/dist*') === -1) {
      content += `\n\n# Jota AEM build\n/build/dist*\n/build/${options.projectName}*.zip`
      fs.writeFileSync(gitignorePath, content)
    }
  })
}

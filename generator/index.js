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
      'build:review': 'vue-cli-service buildaem --snapshot=1',
      'build:prod': 'vue-cli-service buildaem'
    },
    vue: {
      pluginOptions: {
        buildaem: {
          name: options.projectName,
          clientlibs: [options.projectName]
        }
      }
    }
  })
}

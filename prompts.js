module.exports = pkg => {
  return [
    {
      name: 'projectName',
      type: 'input',
      message: 'What is your project name ?',
      validate: input => !!input,
      default: pkg.name
    },
    {
      name: 'devBuildSuffix',
      type: 'input',
      message: 'Define a suffix to identify dev bundles',
      validate: input => !!input,
      default: '-SNAPSHOT'
    },
    {
      name: 'installTemplate',
      type: 'confirm',
      message: 'A build template will be installed under the "/build" directory of your project. Choose "no" if you want to handle it yourself. Otherwise keep "yes".',
      default: true
    },
    {
      name: 'aemPackageInternalPath',
      type: 'input',
      message: 'Path inside the AEM package. If you said yes to the previous question, the default is already correct.',
      validate: input => !!input,
      default: '/etc/clientlibs/frontend'
    },
    {
      name: 'preBuild',
      type: 'confirm',
      message: 'Do you need to execute some script before the vue-cli-service build ?',
      default: false
    },
    {
      name: 'preBuildPath',
      type: 'input',
      message: 'Enter the path (relative to your project root) to the file containing the pre build script.',
      validate: input => !!input,
      when: answers => answers.preBuild,
      default: 'scripts/prebuild.js'
    },
    {
      name: 'postBuild',
      type: 'confirm',
      message: 'Do you need to execute some script after the vue-cli-service build (but before the bundling into a clientlib) ?',
      default: false
    },
    {
      name: 'postBuildPath',
      type: 'input',
      message: 'Enter the path (relative to your project root) to the file containing the post build script.',
      validate: input => !!input,
      when: answers => answers.postBuild,
      default: 'scripts/postbuild.js'
    },
    {
      name: 'aemPackageGroup',
      type: 'input',
      message: 'AEM Package Group. Will store your package in this group in AEM CRX. Used only for packages organisation.',
      validate: input => !!input,
      default: 'Jota Frontend AEM'
    }
  ]
}

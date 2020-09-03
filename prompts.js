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
      name: 'aemPackageGroup',
      type: 'input',
      message: 'AEM Package Group. Will store your package in this group in AEM CRX. Used only for packages organisation.',
      validate: input => !!input,
      default: 'Jota Frontend AEM'
    }
  ]
}

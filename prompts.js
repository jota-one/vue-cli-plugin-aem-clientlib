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
    }
  ]
}

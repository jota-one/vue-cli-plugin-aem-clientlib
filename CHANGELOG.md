# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# [Unreleased]
- All the code is released \o/

## [0.7.3] - 2021-06-11
### Fixed
- Handle rawArgs when calling vue-cli-service build command in order to avoid a bug with modern build

## [0.7.2] - 2021-06-04
### Added
- One `aemDest` plugin option. If provided, allows you to define precisely where you want to save the generated crx package.

## [0.7.1] - 2021-06-04
### Changed
- Ensure that the generated zip file is saved next to its source directory and not systematically in the `/build` directory.

## [0.7.0] - 2021-06-04
### Added
- One `isClientLib` plugin option, defaults to `true`. If set to `false` the script will consider that we just want to bundle some files in a CRX package, but won't create the specific clientlib files (js.txt and css.txt).
- One `aemSource` option in the aem bundle function to let us specify which directory should be bundled for AEM. Until now it was automatically the `vue-cli-service build` output directory. If `aemSource` is not provided, it will default to the `vue-cli-service build` output directory, like before.
### Removed
- /!\ BREAKING CHANGE: Removed the webpack configurations from the main script and moved them as a prebuild function example.

## [0.6.0] - 2021-01-22
TODO

[Unreleased]: https://github.com/jota-one/vue-cli-plugin-aem-clientlib/compare/0.7.3...develop
[0.7.3]: https://github.com/jota-one/vue-cli-plugin-aem-clientlib/compare/0.7.2...0.7.3
[0.7.2]: https://github.com/jota-one/vue-cli-plugin-aem-clientlib/compare/0.7.1...0.7.2
[0.7.1]: https://github.com/jota-one/vue-cli-plugin-aem-clientlib/compare/0.7.0...0.7.1
[0.7.0]: https://github.com/jota-one/vue-cli-plugin-aem-clientlib/compare/0.6.0...0.7.0
[0.6.0]: https://github.com/jota-one/vue-cli-plugin-aem-clientlib/releases/tag/0.6.0

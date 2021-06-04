/**
 * This is an example of a prebuild function that will tweak a little bit the
 * webpack configuration to ensure that the JS entry point is not generated with a
 * hash and to remove the prefetch links generation.
 *
 * @param api
 * @param resolvedOptions
 */
module.exports = function (api, resolvedOptions) {
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
}

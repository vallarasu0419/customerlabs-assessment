/**
 * Webpack Configuration — Action Recorder Widget
 *
 * Produces three build artifacts:
 *   build/action_recorder.min.js   — React widget (UMD)
 *   build/action_recorder.min.css  — Extracted CSS
 *   build/index.js                 — Lightweight loader script
 */

var path             = require('path');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function (env, argv) {
  var isProduction = argv.mode === 'production';

  /** Shared Babel rule for JS / JSX */
  var babelRule = {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: { loader: 'babel-loader' }
  };

  return [
    /* ── Widget bundle ─────────────────────────────────────────────── */
    {
      name: 'widget',
      entry: './src/index.js',

      // Task 24 — output
      output: {
        path:          path.resolve(__dirname, 'build'),
        filename:      'action_recorder.min.js',
        library:       'ActionRecorder',
        libraryTarget: 'umd',
        globalObject:  'this'   // works in both browser and Node
      },

      // Task 25 — module rules
      module: {
        rules: [
          babelRule,
          {
            test: /\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader:  'css-loader',
                options: {
                  modules: {
                    // Short hashes in production; readable names in dev
                    localIdentName: isProduction
                      ? '[hash:base64:8]'
                      : '[name]__[local]'
                  }
                }
              }
            ]
          }
        ]
      },

      // Task 26 — plugins
      plugins: [
        new MiniCssExtractPlugin({ filename: 'action_recorder.min.css' })
      ],

      // Task 27 — resolve + optimization
      resolve:      { extensions: ['.js', '.jsx'] },
      optimization: { minimize: isProduction }
    },

    /* ── Loader bundle ─────────────────────────────────────────────── */
    {
      name: 'loader',
      entry: './src/loader.js',

      // Task 28 — loader output + devtool
      output: {
        path:     path.resolve(__dirname, 'build'),
        filename: 'index.js'
      },
      module: {
        rules: [{ test: /\.js$/, exclude: /node_modules/, use: { loader: 'babel-loader' } }]
      },
      devtool:      false,         // no source maps for the loader
      optimization: { minimize: isProduction }
    }
  ];
};

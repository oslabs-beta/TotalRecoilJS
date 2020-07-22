const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');

module.exports = {
  // Files to bundle
  entry: {
    bundle: './extension/frontend/view/view.js',
    // "create-panel": './extension/devtools/create-panel.js'
    background: './extension/backend/background.js',
    hook: './extension/backend/hook.js',
  },
  // Location to bundle them to
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build/extension'),
  },
  // Modules to load non-jacvascript files
  module: {
    rules: [
      // CSS Loader
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      // SASS Loader
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        rules: [
          {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
        ],
      },
      {
        test: /\.jsx?/,
        exclude: /(node_modules)/,
        resolve: {
          extensions: ['.js', '.jsx'],
        },
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },

  plugins: [
    // Copies files to 'build' folder without bundling them
    new CopyPlugin({
      patterns: [
        { from: 'extension/manifest.json', to: '../extension/manifest.json' },
        {
          from: 'extension/backend/background.js',
          to: '../extension/background.js',
        },
        {
          from: 'extension/frontend/devtools-root.html',
          to: '../extension/devtools-root.html',
        },
        {
          from: 'extension/frontend/create-panel.js',
          to: '../extension/create-panel.js',
        },
        {
          from: 'extension/frontend/view/view.html',
          to: '../extension/view.html',
        },
        {
          from: 'extension/frontend/view/style.css',
          to: '../extension/style.css',
        },
        // { from: 'extension/backend/hook.js', to: '../extension/hook.js' },
        {
          from: 'extension/backend/content_script.js',
          to: '../extension/content_script.js',
        },
      ],
    }),
    // Enables hot reloading - use npm run dev command
    new ExtensionReloader({
      manifest: path.resolve(__dirname, './extension/manifest.json'),
      entries: {
        bundle: 'bundle',
        background: '`background',
      },
    }),
  ],

  optimization: {
    minimize: false,
  },

  devtool: 'cheap-module-source-map', // Needed as to stop Chrome eval errors when using dev server
};

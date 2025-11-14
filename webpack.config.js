const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx', // your entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, // cleans old builds
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      'react-native$': 'react-native-web', // RN Web alias
    },
  },
  module: {
    rules: [
      // TypeScript
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // SVGs as React components
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      // Images
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // points to your HTML template
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 3000,
    hot: true,
    open: true, // opens browser automatically
  },
};

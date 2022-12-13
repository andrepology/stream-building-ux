const webpack = require('webpack');
const dotenv = require('dotenv').config({ path: '/.env' })
const isDevelopment = process.env.NODE_ENV !== 'production'

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
        process: {},
      'process.env': JSON.stringify(dotenv.parsed),
      'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
    }),
  ].filter(Boolean),
}
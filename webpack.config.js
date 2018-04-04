const webpack = require("webpack");
const path = require("path");
const merge = require('webpack-merge');

var config = {
  output: {
    path: path.resolve(__dirname + "/dist/"),
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: __dirname,
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.css$/,
        loader: "style!less!css"
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      sourceMap: false,
      mangle: true,
      compress: {
        warnings: false
      }
    })
  ]
};

module.exports = [
  merge(config, {
    entry: path.resolve(__dirname + "/src/Editor.vue"),
    output: {
      filename: "v-editor.js",
      library: 'Editor',
      libraryTarget: 'umd',
      umdNamedDefine: true    
    }
  })
];

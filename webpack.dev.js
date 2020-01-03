const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common');
const webpack = require('webpack');
const postcssEnv = require('postcss-preset-env');
const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin');
function recursiveIssuer(m) {
    if (m.issuer) {
      return recursiveIssuer(m.issuer);
    } else if (m.name) {
      return m.name;
    } else {
      return false;
    }
  }
module.exports = merge(common, {
    mode: 'development',
    entry: [
        'webpack-hot-middleware/client', 
        './src/assets/web-components/contact-modal.js', 
        '@babel/polyfill'
    ],
    module: {
        rules: [{
                test: /\.(s*)css$/,
                use: [{
                        loader: ExtractCssChunksPlugin.loader,
                        options: {
                            hot: true,
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            importLoaders: 3
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            indent: 'postcss',
                            plugins: () => postcssEnv(),
                            sourceMap: 'inline',
                        },

                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ],
                        plugins: [
                            "@babel/plugin-transform-regenerator"
                        ]
                    }
                }]
            },
            {
                test: /\.ejs$/,
                use: [{
                        loader: 'html-loader',
                        options: {
                            interpolate: 'require'
                        }
                    },
                    'ejs-html-loader'
                ]
            },
            {
                test: /\.(svg|png)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        publicPath: path.resolve(__dirname, '/assets/img'),
                        outputPath: 'assets/img',
                        filename: '[name].[ext]',
                        esModule: false
                    }
                }
            },
            {
                test: /\.(ttf|woff|woff2)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        publicPath: path.resolve(__dirname, '/assets/fonts'),
                        outputPath: 'assets/fonts',
                        filename: '[name].[ext]',
                        esModule: false
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/views/pages/index.ejs',
            filename: 'index.html',
        }),
        new ExtractCssChunksPlugin({
            filename: 'assets/css/[name].css',
            chunkFilename: 'assets/css/[id].css',
        })
    ]
});
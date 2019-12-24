const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common');
const webpack = require('webpack');
const postcssEnv = require('postcss-preset-env');
const HotMiddleWarePlugin = require('webpack-hot-middleware');
const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin');

module.exports = merge(common, {
    mode: 'development',
    entry: [
        'webpack-hot-middleware/client'
    ],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: ExtractCssChunksPlugin.loader,
                        options: {
                            hot: true
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            importLoader: 1
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            preset: () => postcssEnv(),
                            sourceMap: 'inline',
                            indent: 'postcss'
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
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                ]
            },
            {
                test: /\.ejs$/,
                use: [
                    'html-loader',
                    'ejs-html-loader'
                ]
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
            filename: '[name].css'
        })
    ]
});
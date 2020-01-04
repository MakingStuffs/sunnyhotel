
const imageminPngquant = require("imagemin-pngquant");
const imageminSvgo = require("imagemin-svgo");
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common');
const postcssEnv = require('postcss-preset-env');
const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    entry: [
        './src/assets/web-components/contact-modal.js',
        '@babel/polyfill'
    ],
    module: {
        rules: [{
                test: /\.(s*)css$/,
                use: [{
                        loader: ExtractCssChunksPlugin.loader,
                        options: {
                            hot: false,
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
                            interpolate: 'require',
                        }
                    },
                    'ejs-html-loader'
                ]
            },
            {
                test: /\.(svg|png)$/,
                loaders: [{
                        loader: 'file-loader',
                        options: {
                            publicPath: 'https://sunnyhotelbatala.com/assets/img/',
                            outputPath: 'assets/img/',
                            esModule: false
                        },

                    },
                    {
                        loader: 'img-loader',
                        options: {
                            plugins: [
                                imageminPngquant({
                                    floyd: 0.5,
                                    speed: 2
                                }),
                                imageminSvgo({
                                    plugins: [{
                                            removeTitle: true
                                        },
                                        {
                                            convertPathData: false
                                        }
                                    ]
                                })
                            ]
                        }
                    }
                ]
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
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'https://sunnyhotelbatala.com/',
        filename: 'assets/js/[name].[hash].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/views/pages/index.ejs',
            filename: 'index.html',
            path: '/'
        }),
        new ExtractCssChunksPlugin({
            filename: 'assets/css/[name].css',
            chunkFilename: 'assets/css/[id].css',
        })
    ]
});
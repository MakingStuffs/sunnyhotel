const express = require('express');
const config = require('../webpack.dev');
const WebpackHotMiddleware = require('webpack-hot-middleware');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const compiler = webpack(config);
const app = express();

app.use(WebpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
}));

app.use(WebpackHotMiddleware(compiler));

app.listen(3000, () => console.log('Connected on 3000'));
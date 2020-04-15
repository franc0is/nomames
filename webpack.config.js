const path = require('path');
const copy = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        app: './src/index.js'
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'app.bundle.js',
        sourceMapFilename: 'app.bundle.js.map'
    },

    devtool: 'source-map',

    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src/'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },

    devServer: {
        contentBase: path.resolve(__dirname, 'build'),
    },

    plugins: [
        new copy([
            {
                from: path.resolve(__dirname, 'index.html'),
                to: path.resolve(__dirname, 'build')
            },
            {
                from: path.resolve(__dirname, 'assets', '**', '*'),
                to: path.resolve(__dirname, 'build')
            }
        ]),
        new webpack.DefinePlugin({
            'typeof CANVAS_RENDERER': JSON.stringify(true),
            'typeof WEGL_RENDERER': JSON.stringify(true),
        })
    ]
};
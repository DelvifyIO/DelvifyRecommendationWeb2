const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const pug = {
    test: /\.pug$/,
    use: ['html-loader?attrs=false', 'pug-html-loader']
};

const config = {
    entry: {
        main: './src/js/index.js',
        home: './src/js/home.js',
        product: './src/js/product.js',
        productDetails: './src/js/product-details.js',
        cart: './src/js/cart.js',
        widget: './src/js/widget.js',
        searchBar: './src/js/searchBar.js',
        password: './src/js/password.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [pug, {
            test: /\.exec\.js$/,
            use: [ 'script-loader' ]
        }],
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/views/home.pug',
            inject: false
        }),
        new HtmlWebpackPlugin({
            filename: 'product.html',
            template: 'src/views/product.pug',
            inject: false
        }),
        new HtmlWebpackPlugin({
            filename: 'product-details.html',
            template: 'src/views/product-details.pug',
            inject: false
        }),
        new HtmlWebpackPlugin({
            filename: 'cart.html',
            template: 'src/views/cart.pug',
            inject: false
        }),
    ]
};
module.exports = config;
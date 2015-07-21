module.exports = {
    entry: "./src/index.js",
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel'
            },
            {
                test: require.resolve('./src/Channel'),
                loader: 'expose?Channel!babel'
            }
        ]
    },
    output: {
        path: __dirname + "/dist",
        filename: "channels.js"
    }
};
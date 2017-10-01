var webpack = require('webpack');

module.exports = {
	entry: './src/js/index.js',
	output: {
		path: 'www',
		filename: 'bundle.js'
	},
	devServer: {
		inline: true,
		contentBase: './www',
		port: 3000
	},
  plugins: [
      new webpack.DefinePlugin({
          ENV: JSON.stringify(process.env.NODE_ENV),
      }),
  ],
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				loader: 'babel',
				query: {
					presets: ['flow', 'es2015', 'stage-0']
				}
			},
			{
				test: /\.(scss|css)$/,
				loader: 'style-loader!css-loader!svg-fill/encodeSharp!sass-loader'
			},
			{
		    test: /\.(png|jpg)$/,
		    loader: 'url-loader?limit=10000'
			},
			{
				test: /\.svg((\?.*)?|$)/,
				loader: 'svg-url-loader!svg-fill-loader',
	    }
		]
	}
};

module.exports = [
    // JavaScript: Use Babel to transpile JavaScript files
    {
      test: /\.js$/,
      use: ['babel-loader']
    },

    // Images: Copy image files to build folder
    {
      test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
      type: 'asset/resource'
    },

    // Fonts and SVGs: Inline files
    {
      test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
      type: 'asset/inline'
    },
  ]
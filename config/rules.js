module.exports = [
  // JavaScript: Use Babel to transpile JavaScript files
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          ['@babel/preset-env',
            // 使用promise 更高级语法
            {
              useBuiltIns: 'usage',
              "modules": false,
              corejs: 3,
              targets: {
                chrome: '58',
                ie: '9',
                firefox: '60',
                safari: '10',
                edge: '17'
              }
            }
          ]
        ]
      }
    }
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
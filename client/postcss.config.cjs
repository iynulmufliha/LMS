// postcss.config.cjs
module.exports = {
  plugins: [
    require('tailwindcss'),     // first
    require('autoprefixer'),    // …then others
  ],
}

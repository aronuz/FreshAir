module.exports = {
  theme: {
    extend: {
      colors: {
        'my-light': 'rgb(var(--color-my-light) / <alpha-value>)',
        'my-dark': 'rgb(var(--color-my-dark) / <alpha-value>)',
      },
    },
  },
  typography: {
    fontSizeMin: 1.125,
    fontSizeMax: 1.25,
    msFactorMin: 1.125,
    msFactorMax: 1.2,
    lineHeight: 1.6,
  },
}
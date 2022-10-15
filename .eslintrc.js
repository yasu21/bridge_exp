module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  extends: ['@nuxtjs', 'plugin:nuxt/recommended'],
  plugins: [],
  // add your custom rules here
  rules: {
    // camelcase: [2, { properties: 'never' }],
    camelcase: ['error', { properties: 'never' }],
    'no-console': 'off'
  },
  overrides: [
    {
      files: ['layouts/default.vue', 'layouts/error.vue', 'index.vue'],
      rules: {
        'vue/multi-word-component-names': 'off'
      }
    }
  ]
}

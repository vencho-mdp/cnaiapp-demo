module.exports = {
  moduleFileExtensions: [
    'js',
    'json',
    'vue'
  ],
  transform: {
    '.*\\.(vue)$': '@vue/vue2-jest',
    '.*\\.(js)$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js',
    '~/([a-zA-Z0-9/.\\-_]*)': '<rootDir>/$1',
    '/^~/(.*)$/': './$1',
    '^.+\\.(css)$': '<rootDir>/test/__mocks__/css.js'
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js']
}

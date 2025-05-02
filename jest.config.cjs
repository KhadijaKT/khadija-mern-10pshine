module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^node-fetch$": "<rootDir>/node_modules/node-fetch"
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  testMatch: [
    "**/__tests__/**/*.js?(x)", 
    "**/?(*.)+(spec|test).js?(x)",
    "**/src/tests/**/*.js?(x)"
  ],
  transformIgnorePatterns: [
    "/node_modules/(?!react-router|react-router-dom|@remix-run)/"
  ],
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"]
  },
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^node-fetch$": "<rootDir>/node_modules/node-fetch"
  }
};
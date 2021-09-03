module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended", 
  "parserOptions": {
    "ecmaVersion": 8
  },
  "rules": {
    "no-inner-declarations" : "off",
    "no-empty" : ["warn", { "allowEmptyCatch": true }]
  }
};
# try-expr [![Build Status](https://travis-ci.org/JsCommunity/try-expr.png?branch=master)](https://travis-ci.org/JsCommunity/try-expr)

> Try/catch as an expression with filtered catch clauses.

## Install

Installation of the [npm package](https://npmjs.org/package/try-expr):

```
> npm install --save try-expr
```

## Usage

```js
import tryExpr from 'try-expr'

const data = tryExpr(
  JSON.parse
).catch(SyntaxError, error => {
  // syntax error, returns a default value
  return null
})(jsonValue)
```

Ideal with promises:

```js
const safeParseJson = tryExpr(
  JSON.parse
).catch(SyntaxError, error => {
  return null
})

readFile('./data.json').then(safeParseJson).then(data => {
  // do something with the data
})
```

Works with async functions:

```js
const safeReadFile = tryExpr(
    readFile
).catch({ code: 'ENOENT'}, error => {
  return ''
})

safeReadFile('./data.json').then(data => {
  // do something with the data
})

If no function is passed to `tryExpr()`, the first param of the chain will be considered as the error to match `catch` clauses with, which makes it handy with `Promise#catch()`:

```js
readFile('./data.json').catch(
  tryExpr().catch({ code: 'ENOENT' }, error => {
    // file does not exist, return an empty string for instance
    return ''
  })
)
```

## Development

```
# Install dependencies
> npm install

# Run the tests
> npm test

# Continuously compile
> npm run dev

# Continuously run the tests
> npm run dev-test

# Build for production (automatically called by npm install)
> npm run build
```

## Contributions

Contributions are *very* welcomed, either on the documentation or on
the code.

You may:

- report any [issue](https://github.com/JsCommunity/try-expr/issues)
  you've encountered;
- fork and create a pull request.

## License

ISC © [Julien Fontanet](https://github.com/julien-f)

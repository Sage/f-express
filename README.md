# f-express

Express wrapper for f-promise

`f-express` is a companion package for [`f-promise`](https://github.com/Sage/f-promise). 

## Installation

``` sh
npm install --save f-express
```

## Usage

Just import f-express instead of express.

```js
import * as express from 'f-express';

const app = express(); // as usual
// more ...
```

`f-express` provides the same API as `express`. 

The only difference is that you can use `f-promise`'s `wait` call inside `f-express` handlers.

See [this unit test](test/basic-test.ts) for an example.

## License

MIT.


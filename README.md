# ts-core

[![license](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue")](LICENSE-MIT)
[![docs](https://img.shields.io/badge/docs-typescript-blue.svg)](https://aicacia.github.io/ts-core/)
[![npm (scoped)](https://img.shields.io/npm/v/@aicacia/core)](https://www.npmjs.com/package/@aicacia/core)
[![build](https://github.com/aicacia/ts-core/workflows/Test/badge.svg)](https://github.com/aicacia/ts-core/actions?query=workflow%3ATest)

aicacia core utils

## Options

```ts
import { Option, none } from "@aicacia/core";

const maybe = none<number>();

if (maybe.isNone()) {
  maybe.replace(1);
}

console.log(maybe.unwrap()); // 1
```

## Result

```ts
import { Result, ok, err } from "@aicacia/core";

fetch("/api")
  .then((res) => ok(res))
  .catch((e) => err<Response>(e))
  .then((result) => {
    if (result.isOk()) {
      console.log(result.unwrap());
    } else {
      console.error(result.unwrapErr());
    }
  });
```

## Iter

```ts
import { iter } from "@aicacia/core";

const evens = iter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .map((x) => x * x)
  .filter((x) => x % 2 === 0);

for (const value of evens) {
  console.log(value);
}
```

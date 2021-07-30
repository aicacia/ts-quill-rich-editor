# ts-quill-rich-editor

[![license](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue")](LICENSE-MIT)
[![docs](https://img.shields.io/badge/docs-typescript-blue.svg)](https://aicacia.github.io/ts-quill-rich-editor/)
[![npm (scoped)](https://img.shields.io/npm/v/@aicacia/quill-rich-editor)](https://www.npmjs.com/package/@aicacia/quill-rich-editor)
[![build](https://github.com/aicacia/ts-quill-rich-editor/workflows/Test/badge.svg)](https://github.com/aicacia/ts-quill-rich-editor/actions?query=workflow%3ATest)

aicacia quill rich editor

```ts
import { createQuill } from "../src";

const quill = createQuill(document.getElementById("app"));

quill.on("text-change", (delta) => {
  console.log(delta);
});
```

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuill = void 0;
const tslib_1 = require("tslib");
const quill_1 = tslib_1.__importDefault(require("quill"));
function createQuill(element, placeholder = "Write...") {
    return new quill_1.default(element, {
        modules: {
            syntax: true,
        },
        theme: "rich-editor",
        placeholder,
    });
}
exports.createQuill = createQuill;

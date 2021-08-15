"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderQuill = void 0;
function renderQuill(node, quill) {
    node.innerHTML = `<div class="ql-container ql-snow ql-rich-editor"><div class="ql-editor">${quill.root.innerHTML}</div></div>`;
}
exports.renderQuill = renderQuill;

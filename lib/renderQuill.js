"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderOps = exports.renderQuill = void 0;
const createQuill_1 = require("./createQuill");
function renderQuill(node, quill) {
    node.innerHTML = `<div class="ql-container ql-snow ql-rich-editor"><div class="ql-editor">${quill.root.innerHTML}</div></div>`;
}
exports.renderQuill = renderQuill;
function renderOps(node, ops) {
    const document = node.ownerDocument, tmp = document.createElement("div");
    tmp.style.display = "none";
    document.body.appendChild(tmp);
    const quill = createQuill_1.createQuill(tmp);
    quill.setContents({ ops });
    renderQuill(node, quill);
    document.body.removeChild(tmp);
}
exports.renderOps = renderOps;

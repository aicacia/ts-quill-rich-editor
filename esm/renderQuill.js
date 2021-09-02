import { createQuill } from "./createQuill";
export function renderQuill(node, quill) {
    node.innerHTML = `<div class="ql-container ql-snow ql-rich-editor ql-read-only"><div class="ql-editor">${quill.root.innerHTML}</div></div>`;
    Array.from(node.querySelectorAll(".ql-code-block")).forEach((codeBlock) => {
        codeBlock.innerHTML = window.hljs.highlight(codeBlock.getAttribute("data-language"), codeBlock.innerText).value;
    });
}
export function renderOps(node, ops) {
    const document = node.ownerDocument, tmp = document.createElement("div");
    tmp.style.display = "none";
    document.body.appendChild(tmp);
    const quill = createQuill(tmp);
    quill.setContents({ ops });
    renderQuill(node, quill);
    document.body.removeChild(tmp);
}

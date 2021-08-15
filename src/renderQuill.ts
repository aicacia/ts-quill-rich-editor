import Quill from "quill";

export function renderQuill(node: HTMLElement, quill: Quill) {
  node.innerHTML = `<div class="ql-container ql-snow ql-rich-editor"><div class="ql-editor">${
    (quill as any).root.innerHTML
  }</div></div>`;
}

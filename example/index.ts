import { createQuill, renderQuill } from "../src";

function onLoad() {
  const quill = createQuill(document.getElementById("editor")),
    display = document.getElementById("display");

  quill.on("text-change", () => {
    renderQuill(display, quill);
  });
}

window.addEventListener("load", onLoad);

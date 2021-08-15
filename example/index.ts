import { debounce } from "@aicacia/debounce";
import { createQuill, renderOps } from "../src";

function onLoad() {
  const quill = createQuill(document.getElementById("editor")),
    display = document.getElementById("display");

  function onChange() {
    renderOps(display, quill.getContents().ops);
  }

  const debouncedOnChange = debounce(onChange, 1000);

  quill.on("text-change", debouncedOnChange);
}

window.addEventListener("load", onLoad);

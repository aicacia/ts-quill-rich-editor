import { createQuill } from "../src";

function onLoad() {
  const quill = createQuill(document.getElementById("editor"));

  quill.on("text-change", (delta) => {
    console.log(delta);
  });
}

window.addEventListener("load", onLoad);

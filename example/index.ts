import { createQuill } from "../src";

function onLoad() {
  const quill = createQuill(document.getElementById("app"));

  quill.on("text-change", (delta) => {
    console.log(delta);
  });
}

window.addEventListener("load", onLoad);

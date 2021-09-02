import Quill from "quill";
export function createQuill(element, placeholder = "Write...") {
    return new Quill(element, {
        modules: {
            syntax: true,
        },
        theme: "rich-editor",
        placeholder,
    });
}

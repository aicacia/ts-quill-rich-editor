import Quill from "quill";
export function createQuill(element, placeholder = "Write... (Long Click/Press to Open Toolbar)") {
    return new Quill(element, {
        modules: {
            syntax: true,
        },
        theme: "rich-editor",
        placeholder,
    });
}

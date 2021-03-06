import Quill from "quill";
import "long-press-event";
const Parchment = Quill.import("parchment");
const Registry = Parchment.Registry;
const LinkBlot = Quill.import("formats/link");
const FormulaBlot = Quill.import("formats/formula");
const Tooltip = Quill.import("ui/tooltip");
export class RichEditorTooltip extends Tooltip {
    constructor(quill, bounds) {
        super(quill, bounds);
        this.textbox = this.root.querySelector('input[type="text"]');
        this.textarea = this.root.querySelector("textarea");
        this.katex = this.root.querySelector("div.ql-katex");
        this.listen();
    }
    listen() {
        var _a, _b;
        const container = this.quill.container, root = this.quill.root;
        if (typeof MutationObserver === "function") {
            const onClick = (event) => {
                if (!container.contains(event.target) &&
                    !this.root.classList.contains("ql-hidden")) {
                    this.hide();
                    event.preventDefault();
                    event.stopPropagation();
                }
            }, document = container.ownerDocument;
            document.addEventListener("click", onClick);
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const removedNode of Array.from(mutation.removedNodes)) {
                        if (removedNode === container) {
                            document.removeEventListener("click", onClick);
                            observer.disconnect();
                        }
                    }
                }
            });
            observer.observe(container.parentElement, { childList: true });
        }
        root.setAttribute("data-long-press-delay", "500");
        root.addEventListener("long-press", (event) => {
            if (this.root.classList.contains("ql-editing")) {
                return;
            }
            const range = this.quill.getSelection(true);
            if (range) {
                this.openAt(range);
                event.preventDefault();
                event.stopPropagation();
            }
        });
        container.addEventListener("click", (event) => {
            const blot = Registry.find(event.target, true);
            if (blot) {
                if (blot instanceof FormulaBlot) {
                    this.range = {
                        index: blot.offset(this.quill.scroll),
                        length: blot.length(),
                    };
                    this.edit("formula", FormulaBlot.value(blot.domNode));
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        }, { capture: true });
        this.textarea.addEventListener("input", () => {
            window.katex.render(this.textarea.value, this.katex, {
                throwOnError: false,
                errorColor: "#f00",
            });
        });
        this.textbox.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                this.save();
                event.preventDefault();
            }
            else if (event.key === "Escape") {
                this.cancel();
                event.preventDefault();
            }
        });
        this.quill.on("selection-change", (range, _oldRange, source) => {
            if (range != null && source === "user") {
                if (range.length === 0 &&
                    !this.root.classList.contains("ql-hidden")) {
                    this.hide();
                }
                else if (range.length > 0) {
                    this.openAt(range);
                }
                else {
                    const [link, linkOffset] = this.quill.scroll.descendant(LinkBlot, range.index);
                    if (link != null) {
                        this.range = {
                            index: range.index - linkOffset,
                            length: link.length(),
                        };
                        this.edit("link", LinkBlot.formats(link.domNode));
                    }
                }
            }
        });
        (_a = this.root.querySelector(".ql-save")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            this.save();
        });
        (_b = this.root.querySelector(".ql-close")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            this.cancel();
        });
        this.quill.on("scroll-optimize", () => {
            setTimeout(() => {
                if (this.root.classList.contains("ql-hidden"))
                    return;
                const range = this.quill.getSelection();
                if (range != null) {
                    this.position(this.quill.getBounds(range.index, range.length));
                }
            }, 1);
        });
    }
    openAt(range) {
        this.show();
        this.root.style.left = "0px";
        this.root.style.width = "";
        this.root.style.width = `${this.root.offsetWidth}px`;
        const lines = this.quill.getLines(range.index, range.length);
        if (lines.length <= 1) {
            this.position(this.quill.getBounds(range.index, range.length));
        }
        else {
            const lastLine = lines[lines.length - 1];
            const index = this.quill.getIndex(lastLine);
            const length = Math.min(lastLine.length() - 1, range.index + range.length - index);
            const indexBounds = this.quill.getBounds(index, length);
            this.position(indexBounds);
        }
    }
    position(reference) {
        const left = reference.left + reference.width / 2 - this.root.offsetWidth / 2;
        const top = reference.bottom + this.quill.root.scrollTop;
        this.root.style.left = `${left}px`;
        this.root.style.top = `${top}px`;
        const containerBounds = this.boundsContainer.getBoundingClientRect();
        const rootBounds = this.root.getBoundingClientRect();
        let shift = 0;
        if (rootBounds.right > containerBounds.right) {
            shift = containerBounds.right - rootBounds.right;
            this.root.style.left = `${left + shift}px`;
        }
        if (rootBounds.left < containerBounds.left) {
            shift = containerBounds.left - rootBounds.left;
            this.root.style.left = `${left + shift}px`;
        }
        const arrow = this.root.querySelector(".ql-tooltip-arrow");
        arrow.style.marginLeft = "";
        if (shift !== 0) {
            arrow.style.marginLeft = `${-1 * shift - arrow.offsetWidth / 2}px`;
        }
        return shift;
    }
    show() {
        this.root.classList.remove("ql-editing");
        this.root.classList.remove("ql-hidden");
        if (this.textbox)
            this.textbox.value = "";
        if (this.textarea)
            this.textarea.value = "";
        if (this.katex)
            this.katex.innerHTML = "";
        this.root.removeAttribute("data-mode");
    }
    hide() {
        this.root.classList.remove("ql-editing");
        this.root.classList.add("ql-hidden");
        this.root.removeAttribute("data-mode");
    }
    cancel() {
        this.show();
    }
    edit(mode, preview) {
        this.root.classList.remove("ql-hidden");
        this.root.classList.add("ql-editing");
        if (preview != null) {
            if (mode === "formula") {
                this.textarea.value = preview;
                this.textbox.value = "";
            }
            else {
                this.textbox.value = preview;
                this.textarea.value = "";
            }
        }
        this.position(this.quill.getBounds(this.quill.selection.savedRange));
        if (mode === "formula") {
            this.textarea.select();
        }
        else {
            this.textbox.select();
            this.textbox.setAttribute("placeholder", this.textbox.getAttribute(`data-${mode}`) || "");
        }
        this.root.setAttribute("data-mode", mode);
    }
    restoreFocus() {
        const scrollingContainer = this.quill
            .scrollingContainer, scrollTop = scrollingContainer.scrollTop;
        this.quill.focus();
        scrollingContainer.scrollTop = scrollTop;
    }
    save() {
        const mode = this.root.getAttribute("data-mode");
        let value = mode === "formula" ? this.textarea.value : this.textbox.value;
        switch (mode) {
            case "link": {
                const scrollTop = this.quill.root.scrollTop;
                if (this.range) {
                    this.quill.formatText(this.range, "link", value, "user");
                    this.range = undefined;
                }
                else {
                    this.restoreFocus();
                    this.quill.format("link", value, "user");
                }
                this.quill.root.scrollTop = scrollTop;
                break;
            }
            case "video": {
                value = extractVideoUrl(value);
            }
            case "formula": {
                if (!value)
                    break;
                if (this.range) {
                    this.quill.deleteText(this.range.index, this.range.length, "user");
                    this.range = undefined;
                }
                const range = this.quill.getSelection(true);
                if (range != null) {
                    const index = range.index + range.length;
                    this.quill.insertEmbed(index, mode, value, "user");
                    if (mode === "formula") {
                        this.quill.insertText(index + 1, " ", "user");
                    }
                    this.quill.setSelection(index + 2, 0, "user");
                }
                break;
            }
            default:
        }
        this.hide();
    }
}
RichEditorTooltip.TEMPLATE = [
    '<span class="ql-tooltip-arrow"></span>',
    '<div class="ql-tooltip-editor">',
    '<input type="text" data-link="https://quilljs.com" data-video="Embed URL"/>',
    '<textarea placeholder="e=mc^2"></textarea>',
    '<div class="ql-katex"></div>',
    '<a class="ql-close"></a>',
    '<a class="ql-save"></a>',
    "</div>",
].join("");
function extractVideoUrl(url) {
    let match = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/) ||
        url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (match) {
        return `${match[1] || "https"}://www.youtube.com/embed/${match[2]}?showinfo=0`;
    }
    else if ((match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/))) {
        return `${match[1] || "https"}://player.vimeo.com/video/${match[2]}/`;
    }
    else {
        return url;
    }
}

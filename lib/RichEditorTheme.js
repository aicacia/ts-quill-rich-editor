"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichEditorTheme = void 0;
const tslib_1 = require("tslib");
const quill_1 = tslib_1.__importDefault(require("quill"));
const emitter_1 = tslib_1.__importDefault(require("quill/core/emitter"));
const base_1 = require("quill/themes/base");
const deepmerge_1 = tslib_1.__importDefault(require("deepmerge"));
const SnowThemeClass = quill_1.default.import("themes/snow");
const LinkBlot = quill_1.default.import("formats/link");
const FormulaEmbed = quill_1.default.import("formats/formula");
const icons = quill_1.default.import("ui/icons");
const TOOLBAR_CONFIG = [
    [{ header: ["1", "2", "3", false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    ["code-block", "formula"],
    [
        {
            list: "ordered",
        },
        {
            list: "bullet",
        },
    ],
    [
        {
            align: [],
        },
    ],
    ["link", "image"],
    ["clean"],
];
class RichEditorTooltip extends base_1.BaseTooltip {
    constructor(quill, bounds) {
        super(quill, bounds);
        this.info = this.root.querySelector("span.ql-info");
        this.preview = this.root.querySelector("a.ql-preview");
        this.formulaPreview = this.root.querySelector("span.ql-preview");
    }
    listen() {
        super.listen();
        this.root
            .querySelector("a.ql-action")
            .addEventListener("click", (event) => {
            if (this.root.classList.contains("ql-editing")) {
                this.save();
            }
            else {
                const mode = this.info.getAttribute("data-mode");
                this.edit(mode, mode === "link"
                    ? this.preview.textContent
                    : this.formulaPreview.textContent);
            }
            event.preventDefault();
        });
        this.root
            .querySelector("a.ql-remove")
            .addEventListener("click", (event) => {
            if (this.linkRange != null) {
                const range = this.linkRange;
                this.restoreFocus();
                this.quill.formatText(range, this.info.getAttribute("data-mode"), false, emitter_1.default.sources.USER);
                delete this.linkRange;
            }
            if (this.formulaRange) {
                this.quill.deleteText(this.formulaRange.index, this.formulaRange.length, emitter_1.default.sources.USER);
                this.formulaRange = undefined;
            }
            event.preventDefault();
            this.hide();
        });
        this.quill.on(emitter_1.default.events.SELECTION_CHANGE, (range, _oldRange, source) => {
            if (range == null)
                return;
            if (range.length === 0 && source === emitter_1.default.sources.USER) {
                const [link, linkOffset] = this.quill.scroll.descendant(LinkBlot, range.index);
                if (link != null) {
                    this.linkRange = {
                        index: range.index - linkOffset,
                        length: link.length(),
                    };
                    const preview = LinkBlot.formats(link.domNode);
                    this.preview.textContent = preview;
                    this.info.setAttribute("data-mode", "link");
                    this.preview.setAttribute("href", preview);
                    this.show();
                    this.position(this.quill.getBounds(this.linkRange.index, this.linkRange.length));
                    return;
                }
                const [formula, formulaOffset] = this.quill.scroll.descendant(FormulaEmbed, range.index);
                console.log(formula, formulaOffset);
                if (formula != null) {
                    this.formulaRange = {
                        index: range.index - formulaOffset,
                        length: formula.length(),
                    };
                    const preview = FormulaEmbed.value(formula.domNode);
                    this.formulaPreview.textContent = preview;
                    this.info.setAttribute("data-mode", "formula");
                    this.show();
                    this.position(this.quill.getBounds(this.formulaRange.index, this.formulaRange.length));
                    return;
                }
            }
            else {
                delete this.linkRange;
            }
            this.hide();
        });
    }
    show() {
        super.show();
        this.root.removeAttribute("data-mode");
    }
    edit(mode, preview) {
        this.root.classList.remove("ql-hidden");
        this.root.classList.add("ql-editing");
        if (preview != null) {
            this.textbox.value = preview;
        }
        else if (mode !== this.root.getAttribute("data-mode")) {
            this.textbox.value = "";
        }
        this.position(this.quill.getBounds(this.quill.selection.savedRange));
        this.textbox.select();
        this.textbox.setAttribute("placeholder", this.textbox.getAttribute(`data-${mode}`) || "");
        this.root.setAttribute("data-mode", mode);
        this.preview.textContent = "";
        this.formulaPreview.textContent = "";
    }
    save() {
        const { value } = this.textbox;
        switch (this.root.getAttribute("data-mode")) {
            case "link": {
                const { scrollTop } = this.quill.root;
                if (this.linkRange) {
                    this.quill.formatText(this.linkRange, "link", value, emitter_1.default.sources.USER);
                    delete this.linkRange;
                }
                else {
                    this.restoreFocus();
                    this.quill.format("link", value, emitter_1.default.sources.USER);
                }
                this.quill.root.scrollTop = scrollTop;
                break;
            }
            case "formula": {
                if (!value)
                    break;
                if (this.formulaRange) {
                    this.quill.deleteText(this.formulaRange.index, this.formulaRange.length, emitter_1.default.sources.USER);
                    this.formulaRange = undefined;
                }
                const range = this.quill.getSelection(true);
                if (range != null) {
                    const index = range.index + range.length;
                    this.quill.insertEmbed(index, this.root.getAttribute("data-mode"), value, emitter_1.default.sources.USER);
                    if (this.root.getAttribute("data-mode") === "formula") {
                        this.quill.insertText(index + 1, " ", emitter_1.default.sources.USER);
                    }
                    this.quill.setSelection(index + 2, emitter_1.default.sources.USER);
                }
                break;
            }
            default:
        }
        this.textbox.value = "";
        this.hide();
    }
}
RichEditorTooltip.TEMPLATE = [
    '<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>',
    '<span class="ql-preview"></span>',
    '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">',
    '<a class="ql-action"></a>',
    '<a class="ql-remove"></a>',
    '<span class="ql-info"></span>',
].join("");
class RichEditorTheme extends SnowThemeClass {
    constructor(quill, options) {
        if (options.modules &&
            options.modules.toolbar != null &&
            options.modules.toolbar.container == null) {
            options.modules.toolbar.container = TOOLBAR_CONFIG;
        }
        super(quill, options);
        this.quill.container.classList.add("ql-rich-editor");
    }
    extendToolbar(toolbar) {
        toolbar.container.classList.add("ql-snow");
        toolbar.container.classList.add("ql-rich-editor");
        this.buildButtons(toolbar.container.querySelectorAll("button"), icons);
        this.buildPickers(toolbar.container.querySelectorAll("select"), icons);
        this.tooltip = new RichEditorTooltip(this.quill, this.options.bounds);
        if (toolbar.container.querySelector(".ql-link")) {
            this.quill.keyboard.addBinding({ key: "k", shortKey: true }, (_range, context) => {
                toolbar.handlers.link.call(toolbar, !context.format.link);
            });
        }
    }
}
exports.RichEditorTheme = RichEditorTheme;
RichEditorTheme.DEFAULTS = deepmerge_1.default({
    modules: {
        toolbar: {
            handlers: {},
        },
    },
}, SnowThemeClass.DEFAULTS);
quill_1.default.register("themes/rich-editor", RichEditorTheme, true);

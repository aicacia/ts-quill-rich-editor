"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichEditorTheme = void 0;
const tslib_1 = require("tslib");
const quill_1 = tslib_1.__importDefault(require("quill"));
const RichEditorTooltip_1 = require("./RichEditorTooltip");
const BubbleTheme = quill_1.default.import("themes/snow");
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
const BUBBLE_DEFAULTS = BubbleTheme.DEFAULTS;
class RichEditorTheme extends BubbleTheme {
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
        toolbar.container.classList.add("ql-rich-editor");
        this.tooltip = new RichEditorTooltip_1.RichEditorTooltip(this.quill, this.options.bounds);
        this.tooltip.root.appendChild(toolbar.container);
        this.buildButtons(toolbar.container.querySelectorAll("button"), icons);
        this.buildPickers(toolbar.container.querySelectorAll("select"), icons);
    }
}
exports.RichEditorTheme = RichEditorTheme;
RichEditorTheme.DEFAULTS = Object.assign(Object.assign({}, BUBBLE_DEFAULTS), { modules: Object.assign(Object.assign({}, BUBBLE_DEFAULTS.modules), { toolbar: Object.assign(Object.assign({}, BUBBLE_DEFAULTS.toolbar), { handlers: {
                link(value) {
                    if (value) {
                        const range = this.quill.getSelection();
                        if (range == null || range.length === 0)
                            return;
                        let preview = this.quill.getText(range);
                        if (/^\S+@\S+\.\S+$/.test(preview) &&
                            preview.indexOf("mailto:") !== 0) {
                            preview = `mailto:${preview}`;
                        }
                        this.quill.theme.tooltip.edit("link", preview);
                    }
                    else {
                        this.quill.format("link", false);
                    }
                },
            } }) }) });
quill_1.default.register("themes/rich-editor", RichEditorTheme, true);

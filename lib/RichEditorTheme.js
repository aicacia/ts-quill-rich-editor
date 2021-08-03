"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichEditorTheme = void 0;
const tslib_1 = require("tslib");
const quill_1 = tslib_1.__importDefault(require("quill"));
const deepmerge_1 = tslib_1.__importDefault(require("deepmerge"));
const RichEditorTooltip_1 = require("./RichEditorTooltip");
const SnowTheme = quill_1.default.import("themes/snow");
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
class RichEditorTheme extends SnowTheme {
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
        this.buildButtons(toolbar.container.querySelectorAll("button"), icons);
        this.buildPickers(toolbar.container.querySelectorAll("select"), icons);
        this.tooltip = new RichEditorTooltip_1.RichEditorTooltip(this.quill, this.options.bounds);
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
}, SnowTheme.DEFAULTS);
quill_1.default.register("themes/rich-editor", RichEditorTheme, true);

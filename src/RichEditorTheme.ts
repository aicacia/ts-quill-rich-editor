import Quill from "quill";
import type { QuillOptionsStatic } from "quill";
import type SnowThemeClass from "quill/themes/snow";
import merge from "deepmerge";
import { RichEditorTooltip } from "./RichEditorTooltip";

const SnowTheme: typeof SnowThemeClass = Quill.import("themes/snow");
const icons = Quill.import("ui/icons");

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

export class RichEditorTheme extends SnowTheme {
  static DEFAULTS = merge(
    {
      modules: {
        toolbar: {
          handlers: {},
        },
      },
    },
    SnowTheme.DEFAULTS
  );

  constructor(quill: Quill, options: QuillOptionsStatic) {
    if (
      options.modules &&
      options.modules.toolbar != null &&
      options.modules.toolbar.container == null
    ) {
      options.modules.toolbar.container = TOOLBAR_CONFIG;
    }
    super(quill, options);
    (this.quill as any).container.classList.add("ql-rich-editor");
  }

  extendToolbar(toolbar: any) {
    toolbar.container.classList.add("ql-rich-editor");

    this.buildButtons(toolbar.container.querySelectorAll("button"), icons);
    this.buildPickers(toolbar.container.querySelectorAll("select"), icons);

    this.tooltip = new RichEditorTooltip(this.quill, this.options.bounds);
    if (toolbar.container.querySelector(".ql-link")) {
      this.quill.keyboard.addBinding(
        { key: "k", shortKey: true },
        (_range, context) => {
          toolbar.handlers.link.call(toolbar, !context.format.link);
        }
      );
    }
  }
}

Quill.register("themes/rich-editor", RichEditorTheme, true);

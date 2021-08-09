import Quill from "quill";
import type { QuillOptionsStatic } from "quill";
import type BubbleThemeClass from "quill/themes/snow";
import merge from "deepmerge";
import { RichEditorTooltip } from "./RichEditorTooltip";

const BubbleTheme: typeof BubbleThemeClass = Quill.import("themes/snow");
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

export class RichEditorTheme extends BubbleTheme {
  static DEFAULTS = merge(
    {
      modules: {
        toolbar: {
          handlers: {
            link(value) {
              if (value) {
                const range = this.quill.getSelection();
                if (range == null || range.length === 0) return;
                let preview = this.quill.getText(range);
                if (
                  /^\S+@\S+\.\S+$/.test(preview) &&
                  preview.indexOf("mailto:") !== 0
                ) {
                  preview = `mailto:${preview}`;
                }
                this.quill.theme.tooltip.edit("link", preview);
              } else {
                this.quill.format("link", false);
              }
            },
          },
        },
      },
    },
    BubbleTheme.DEFAULTS
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

    this.tooltip = new RichEditorTooltip(this.quill, this.options.bounds);
    this.tooltip.root.appendChild(toolbar.container);

    this.buildButtons(toolbar.container.querySelectorAll("button"), icons);
    this.buildPickers(toolbar.container.querySelectorAll("select"), icons);
  }
}

Quill.register("themes/rich-editor", RichEditorTheme, true);

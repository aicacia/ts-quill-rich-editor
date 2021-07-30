import Quill from "quill";
import type { BoundsStatic, QuillOptionsStatic, RangeStatic } from "quill";
import Emitter from "quill/core/emitter";
import { BaseTooltip } from "quill/themes/base";
import type { SnowTheme } from "quill/themes/snow";
import merge from "deepmerge";

const SnowThemeClass: typeof SnowTheme = Quill.import("themes/snow");
const LinkBlot = Quill.import("formats/link");
const FormulaEmbed = Quill.import("formats/formula");
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

class RichEditorTooltip extends BaseTooltip {
  static TEMPLATE = [
    '<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>',
    '<span class="ql-preview"></span>',
    '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">',
    '<a class="ql-action"></a>',
    '<a class="ql-remove"></a>',
    '<span class="ql-info"></span>',
  ].join("");

  protected info: HTMLSpanElement;
  protected preview: HTMLAnchorElement;
  protected formulaPreview: HTMLSpanElement;
  protected formulaRange: RangeStatic | undefined;

  constructor(quill: Quill, bounds: BoundsStatic) {
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
        } else {
          const mode = this.info.getAttribute("data-mode");
          this.edit(
            mode,
            mode === "link"
              ? this.preview.textContent
              : this.formulaPreview.textContent
          );
        }
        event.preventDefault();
      });
    this.root
      .querySelector("a.ql-remove")
      .addEventListener("click", (event) => {
        if (this.linkRange != null) {
          const range = this.linkRange;
          this.restoreFocus();
          this.quill.formatText(
            range,
            this.info.getAttribute("data-mode"),
            false,
            Emitter.sources.USER
          );
          delete this.linkRange;
        }
        if (this.formulaRange) {
          this.quill.deleteText(
            this.formulaRange.index,
            this.formulaRange.length,
            Emitter.sources.USER
          );
          this.formulaRange = undefined;
        }
        event.preventDefault();
        this.hide();
      });
    this.quill.on(
      Emitter.events.SELECTION_CHANGE as "selection-change",
      (range, _oldRange, source) => {
        if (range == null) return;
        if (range.length === 0 && source === Emitter.sources.USER) {
          const [link, linkOffset] = (this.quill.scroll as any).descendant(
            LinkBlot,
            range.index
          );
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
            this.position(
              this.quill.getBounds(this.linkRange.index, this.linkRange.length)
            );
            return;
          }
          const [formula, formulaOffset] = (
            this.quill.scroll as any
          ).descendant(FormulaEmbed, range.index);
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
            this.position(
              this.quill.getBounds(
                this.formulaRange.index,
                this.formulaRange.length
              )
            );
            return;
          }
        } else {
          delete this.linkRange;
        }
        this.hide();
      }
    );
  }

  show() {
    super.show();
    this.root.removeAttribute("data-mode");
  }

  edit(mode: string, preview?: string) {
    this.root.classList.remove("ql-hidden");
    this.root.classList.add("ql-editing");
    if (preview != null) {
      this.textbox.value = preview;
    } else if (mode !== this.root.getAttribute("data-mode")) {
      this.textbox.value = "";
    }
    this.position(
      this.quill.getBounds((this.quill as any).selection.savedRange)
    );
    this.textbox.select();
    this.textbox.setAttribute(
      "placeholder",
      this.textbox.getAttribute(`data-${mode}`) || ""
    );
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
          this.quill.formatText(
            this.linkRange,
            "link",
            value,
            Emitter.sources.USER
          );
          delete this.linkRange;
        } else {
          this.restoreFocus();
          this.quill.format("link", value, Emitter.sources.USER);
        }
        this.quill.root.scrollTop = scrollTop;
        break;
      }
      case "formula": {
        if (!value) break;
        if (this.formulaRange) {
          this.quill.deleteText(
            this.formulaRange.index,
            this.formulaRange.length,
            Emitter.sources.USER
          );
          this.formulaRange = undefined;
        }
        const range = this.quill.getSelection(true);
        if (range != null) {
          const index = range.index + range.length;
          this.quill.insertEmbed(
            index,
            this.root.getAttribute("data-mode"),
            value,
            Emitter.sources.USER
          );
          if (this.root.getAttribute("data-mode") === "formula") {
            this.quill.insertText(index + 1, " ", Emitter.sources.USER);
          }
          this.quill.setSelection(index + 2, Emitter.sources.USER);
        }
        break;
      }
      default:
    }
    this.textbox.value = "";
    this.hide();
  }
}

export class RichEditorTheme extends SnowThemeClass {
  static DEFAULTS = merge(
    {
      modules: {
        toolbar: {
          handlers: {},
        },
      },
    },
    SnowThemeClass.DEFAULTS
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
    toolbar.container.classList.add("ql-snow");
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

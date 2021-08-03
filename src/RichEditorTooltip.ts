import Quill from "quill";
import type { RangeStatic } from "quill";
import type TooltipClass from "quill/ui/tooltip";

const LinkBlot = Quill.import("formats/link");
const FormulaEmbed = Quill.import("formats/formula");
const Tooltip: typeof TooltipClass = Quill.import("ui/tooltip");

export class RichEditorTooltip extends Tooltip {
  static TEMPLATE = [
    '<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>',
    '<span class="ql-preview"></span>',
    '<input type="text"/>',
    "<textarea></textarea>",
    '<div class="ql-katex"></div>',
    '<a class="ql-action"></a>',
    '<a class="ql-remove"></a>',
  ].join("");

  protected textbox: HTMLInputElement;
  protected hrefPreview: HTMLAnchorElement;
  protected spanPreview: HTMLSpanElement;
  protected katexPreview: HTMLDivElement;
  protected textarea: HTMLTextAreaElement;
  protected range: RangeStatic | undefined;

  constructor(quill: Quill, bounds?: HTMLElement) {
    super(quill, bounds);
    this.textbox = this.root.querySelector('input[type="text"]');
    this.hrefPreview = this.root.querySelector("a.ql-preview");
    this.spanPreview = this.root.querySelector("span.ql-preview");
    this.katexPreview = this.root.querySelector("div.ql-katex");
    this.textarea = this.root.querySelector("textarea");
    this.listen();
  }

  listen() {
    this.textbox.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.save();
        event.preventDefault();
      } else if (event.key === "Escape") {
        this.cancel();
        event.preventDefault();
      }
    });
    this.textarea.addEventListener("input", () => {
      (window as any).katex.render(this.textarea.value, this.katexPreview, {
        throwOnError: false,
        errorColor: "#f00",
      });
    });
    this.root
      .querySelector("a.ql-action")
      .addEventListener("click", (event) => {
        if (this.root.classList.contains("ql-editing")) {
          this.save();
        } else {
          const mode = this.root.getAttribute("data-mode");
          this.edit(
            mode,
            mode === "link"
              ? this.hrefPreview.textContent
              : this.spanPreview.getAttribute("data-value")
          );
        }
        event.preventDefault();
      });
    this.root
      .querySelector("a.ql-remove")
      .addEventListener("click", (event) => {
        if (this.range != null) {
          const mode = this.root.getAttribute("data-mode"),
            range = this.range;

          this.restoreFocus();

          if (mode === "link") {
            this.quill.formatText(range, "link", false, "user");
          } else if (mode === "formula") {
            this.quill.deleteText(range.index, range.length, "user");
          }
          this.range = undefined;
        }
        event.preventDefault();
        this.hide();
      });
    this.quill.on("selection-change", (range, _oldRange, source) => {
      if (range == null) return;
      if (range.length === 0 && source === "user") {
        const [link, linkOffset] = (this.quill.scroll as any).descendant(
          LinkBlot,
          range.index
        );
        if (link != null) {
          this.range = {
            index: range.index - linkOffset,
            length: link.length(),
          };
          const preview = LinkBlot.formats(link.domNode);
          this.hrefPreview.textContent = preview;
          this.hrefPreview.setAttribute("href", preview);
          this.show();
          this.position(
            this.quill.getBounds(this.range.index, this.range.length)
          );
          this.root.setAttribute("data-mode", "link");
          return;
        }
        const [formula, formulaOffset] = (this.quill.scroll as any).descendant(
          FormulaEmbed,
          range.index
        );
        if (formula != null) {
          this.range = {
            index: range.index - formulaOffset,
            length: formula.length(),
          };
          const preview = FormulaEmbed.value(formula.domNode);
          this.spanPreview.setAttribute("data-value", preview);
          (window as any).katex.render(preview, this.spanPreview, {
            throwOnError: false,
            errorColor: "#f00",
          });
          this.show();
          this.position(
            this.quill.getBounds(this.range.index, this.range.length)
          );
          this.root.setAttribute("data-mode", "formula");
          return;
        }
      } else {
        delete this.range;
      }
      this.hide();
    });
  }

  hide() {
    super.hide();
    this.root.removeAttribute("data-mode");
    if (this.hrefPreview) {
      this.hrefPreview.textContent = "";
    }
    if (this.spanPreview) {
      this.spanPreview.textContent = "";
    }
    if (this.katexPreview) {
      this.katexPreview.innerHTML = "";
    }
  }

  cancel() {
    this.hide();
  }

  edit(mode: string, preview?: string) {
    this.root.removeAttribute("data-mode");
    this.root.classList.remove("ql-hidden");
    this.root.classList.add("ql-editing");
    if (preview != null) {
      if (mode === "formula") {
        this.textarea.value = preview;
      } else {
        this.textbox.value = preview;
      }
    } else {
      this.textarea.value = "";
      this.textbox.value = "";
    }
    this.position(
      this.quill.getBounds((this.quill as any).selection.savedRange)
    );
    if (mode === "formula") {
      this.textarea.select();
    } else {
      this.textbox.select();
      this.textbox.setAttribute(
        "placeholder",
        this.textbox.getAttribute(`data-${mode}`) || ""
      );
    }
    this.root.setAttribute("data-mode", mode);
  }

  restoreFocus() {
    const scrollingContainer: HTMLElement = (this.quill as any)
        .scrollingContainer,
      scrollTop = scrollingContainer.scrollTop;
    this.quill.focus();
    scrollingContainer.scrollTop = scrollTop;
  }

  save() {
    const mode = this.root.getAttribute("data-mode");
    let value = mode === "formula" ? this.textarea.value : this.textbox.value;

    switch (mode) {
      case "link": {
        const { scrollTop } = this.quill.root;
        if (this.range) {
          this.quill.formatText(this.range, "link", value, "user");
          this.range = undefined;
        } else {
          this.restoreFocus();
          this.quill.format("link", value, "user");
        }
        this.quill.root.scrollTop = scrollTop;
        break;
      }
      case "video": {
        value = extractVideoUrl(value);
      } // eslint-disable-next-line no-fallthrough
      case "formula": {
        if (!value) break;

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

function extractVideoUrl(url: string): string {
  let match =
    url.match(
      /^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/
    ) ||
    url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);

  if (match) {
    return `${match[1] || "https"}://www.youtube.com/embed/${
      match[2]
    }?showinfo=0`;
  } else if (
    (match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/))
  ) {
    return `${match[1] || "https"}://player.vimeo.com/video/${match[2]}/`;
  } else {
    return url;
  }
}

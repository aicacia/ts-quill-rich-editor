import Quill from "quill";
import "long-press-event";
import type * as RegistryModule from "parchment/src/registry";
import type { BoundsStatic, Sources } from "quill";
import type { RangeStatic } from "quill";
import type TooltipClass from "quill/ui/tooltip";

const Parchment = Quill.import("parchment");
const Registry: typeof RegistryModule = Parchment.Registry;
const LinkBlot = Quill.import("formats/link");
const FormulaBlot = Quill.import("formats/formula");
const Tooltip: typeof TooltipClass = Quill.import("ui/tooltip");

export class RichEditorTooltip extends Tooltip {
  static TEMPLATE = [
    '<span class="ql-tooltip-arrow"></span>',
    '<div class="ql-tooltip-editor">',
    '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">',
    '<a class="ql-close"></a>',
    "</div>",
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
    this.listen();
  }

  listen() {
    const container = (this.quill as any).container as HTMLElement;
    container.setAttribute("data-long-press-delay", "500");
    container.addEventListener("long-press", () => {
      if (this.root.classList.contains("ql-editing")) return;
      const range = this.quill.getSelection(true);
      if (range) {
        this.openAt(range);
      }
    });
    container.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.cancel();
        event.preventDefault();
      }
    });
    container.addEventListener("click", (event) => {
      const blot = Registry.find(event.target as HTMLElement, true);

      if (blot) {
        if (blot instanceof FormulaBlot) {
          this.range = {
            index: blot.offset(this.quill.scroll),
            length: blot.length(),
          };
          this.edit("formula", FormulaBlot.value(blot.domNode));
        }
      }
    });
    this.textbox.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.save();
        event.preventDefault();
      } else if (event.key === "Escape") {
        this.cancel();
        event.preventDefault();
      }
    });
    this.quill.on(
      "selection-change",
      (range: RangeStatic, _oldRange: RangeStatic, source: Sources) => {
        if (range != null && source === "user") {
          if (range.length > 0) {
            this.openAt(range);
          } else {
            const [link, linkOffset] = (this.quill.scroll as any).descendant(
              LinkBlot,
              range.index
            );
            if (link != null) {
              this.range = {
                index: range.index - linkOffset,
                length: link.length(),
              };
              this.edit("link", LinkBlot.formats(link.domNode));
            }
          }
        } else if (
          document.activeElement !== this.textbox &&
          this.quill.hasFocus()
        ) {
          this.hide();
        }
      }
    );
    this.root.querySelector(".ql-close").addEventListener("click", () => {
      this.cancel();
    });
    this.quill.on("scroll-optimize" as any, () => {
      setTimeout(() => {
        if (this.root.classList.contains("ql-hidden")) return;
        const range = this.quill.getSelection();
        if (range != null) {
          this.position(this.quill.getBounds(range.index, range.length));
        }
      }, 1);
    });
  }

  openAt(range: RangeStatic) {
    this.show();
    this.root.style.left = "0px";
    this.root.style.width = "";
    this.root.style.width = `${this.root.offsetWidth}px`;
    const lines = this.quill.getLines(range.index, range.length);
    if (lines.length <= 1) {
      this.position(this.quill.getBounds(range.index, range.length));
    } else {
      const lastLine = lines[lines.length - 1];
      const index = this.quill.getIndex(lastLine);
      const length = Math.min(
        lastLine.length() - 1,
        range.index + range.length - index
      );
      const indexBounds = this.quill.getBounds(index, length);
      this.position(indexBounds);
    }
  }

  position(reference: BoundsStatic) {
    const left =
      reference.left + reference.width / 2 - this.root.offsetWidth / 2;
    const top = reference.bottom + this.quill.root.scrollTop;
    this.root.style.left = `${left}px`;
    this.root.style.top = `${top}px`;
    this.root.classList.remove("ql-flip");
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
    if (rootBounds.top - rootBounds.height - 10 > containerBounds.top) {
      const height = rootBounds.bottom - rootBounds.top;
      const verticalShift = reference.bottom - reference.top + height;
      this.root.style.top = `${top - verticalShift}px`;
      this.root.classList.add("ql-flip");
    }
    const arrow = this.root.querySelector<HTMLElement>(".ql-tooltip-arrow");
    arrow.style.marginLeft = "";
    if (shift !== 0) {
      arrow.style.marginLeft = `${-1 * shift - arrow.offsetWidth / 2}px`;
    }
    return shift;
  }

  cancel() {
    this.hide();
  }

  edit(mode = "link", preview = null) {
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
  }

  restoreFocus() {
    const scrollingContainer: HTMLElement = (this.quill as any)
        .scrollingContainer,
      scrollTop = scrollingContainer.scrollTop;
    this.quill.focus();
    scrollingContainer.scrollTop = scrollTop;
  }

  save() {
    let value = this.textbox.value;
    switch (this.root.getAttribute("data-mode")) {
      case "link": {
        const scrollTop = this.quill.root.scrollTop;
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
      }
      case "formula": {
        if (!value) break;
        if (this.range) {
          this.quill.deleteText(this.range.index, this.range.length, "user");
          this.range = undefined;
        }
        const range = this.quill.getSelection(true);
        if (range != null) {
          const index = range.index + range.length;
          this.quill.insertEmbed(
            index,
            this.root.getAttribute("data-mode"),
            value,
            "user"
          );
          if (this.root.getAttribute("data-mode") === "formula") {
            this.quill.insertText(index + 1, " ", "user");
          }
          this.quill.setSelection(index + 2, 0, "user");
        }
        break;
      }
      default:
    }
    this.textbox.value = "";
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

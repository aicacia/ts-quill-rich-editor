declare module "quill/themes/base" {
  import Quill, { BoundsStatic } from "quill";
  import Tooltip from "quill/ui/tooltip";

  export class BaseTooltip extends Tooltip {
    protected quill: Quill;
    protected root: HTMLElement;
    protected textbox: HTMLInputElement;
    protected linkRange: { index: number; length: number } | undefined;

    constructor(quill: Quill, bounds: BoundsStatic);

    show();
    hide();
    position(bounds: BoundsStatic);
    restoreFocus();
    listen();
    save();
    edit(mode: string, value: string);
  }
}

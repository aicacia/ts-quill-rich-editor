declare module "quill/themes/snow" {
  import Quill, { QuillOptionsStatic } from "quill";
  import Tooltip from "quill/ui/tooltip";
  import BaseTheme from "quill/themes/base";

  export class SnowTheme extends BaseTheme {
    static DEFAULTS: Record<string, unknown>;

    protected quill: Quill;
    protected root: HTMLElement;
    protected tooltip: Tooltip;
    protected options: any;

    constructor(quill: Quill, options: QuillOptionsStatic);

    extendToolbar(toolbar: any);
    buildButtons(buttons: NodeList, icons: any);
    buildPickers(pickers: NodeList, icons: any);
  }
}

declare module "quill/ui/tooltip" {
  import Quill, { BoundsStatic } from "quill";
  import Tooltip from "quill/ui/tooltip";

  export default class Tooltip {
    public quill: Quill;
    public root: HTMLElement;
    public boundsContainer: HTMLElement;

    constructor(quill: Quill, bounds: HTMLElement);

    show();
    hide();
    position(bounds: BoundsStatic);
  }
}

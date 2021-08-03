declare module "quill/ui/tooltip" {
  import Quill, { BoundsStatic } from "quill";
  import Tooltip from "quill/ui/tooltip";

  export default class Tooltip {
    protected quill: Quill;
    protected root: HTMLElement;
    protected boundsContainer: HTMLElement;

    constructor(quill: Quill, bounds: HTMLElement);

    show();
    hide();
    position(bounds: BoundsStatic);
  }
}

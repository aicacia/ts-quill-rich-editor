import Quill from "quill";
import "long-press-event";
import type { BoundsStatic } from "quill";
import type { RangeStatic } from "quill";
import type TooltipClass from "quill/ui/tooltip";
declare const Tooltip: typeof TooltipClass;
export declare class RichEditorTooltip extends Tooltip {
    static TEMPLATE: string;
    protected textbox: HTMLInputElement;
    protected hrefPreview: HTMLAnchorElement;
    protected spanPreview: HTMLSpanElement;
    protected katexPreview: HTMLDivElement;
    protected textarea: HTMLTextAreaElement;
    protected range: RangeStatic | undefined;
    constructor(quill: Quill, bounds?: HTMLElement);
    listen(): void;
    openAt(range: RangeStatic): void;
    position(reference: BoundsStatic): number;
    cancel(): void;
    edit(mode?: string, preview?: any): void;
    restoreFocus(): void;
    save(): void;
}
export {};

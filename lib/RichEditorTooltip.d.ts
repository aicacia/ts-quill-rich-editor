import Quill from "quill";
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
    hide(): void;
    cancel(): void;
    edit(mode: string, preview?: string): void;
    restoreFocus(): void;
    save(): void;
}
export {};

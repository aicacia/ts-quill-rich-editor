import Quill from "quill";
import "long-press-event";
import type { BoundsStatic } from "quill";
import type { RangeStatic } from "quill";
import type TooltipClass from "quill/ui/tooltip";
declare const Tooltip: typeof TooltipClass;
export declare class RichEditorTooltip extends Tooltip {
    static TEMPLATE: string;
    protected textbox: HTMLInputElement;
    protected textarea: HTMLTextAreaElement;
    protected katex: HTMLDivElement;
    protected range: RangeStatic | undefined;
    constructor(quill: Quill, bounds?: HTMLElement);
    listen(): void;
    openAt(range: RangeStatic): void;
    position(reference: BoundsStatic): number;
    show(): void;
    hide(): void;
    cancel(): void;
    edit(mode: string, preview?: string): void;
    restoreFocus(): void;
    save(): void;
}
export {};

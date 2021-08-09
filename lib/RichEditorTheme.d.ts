import Quill from "quill";
import type { QuillOptionsStatic } from "quill";
import type BubbleThemeClass from "quill/themes/snow";
declare const BubbleTheme: typeof BubbleThemeClass;
export declare class RichEditorTheme extends BubbleTheme {
    static DEFAULTS: {
        [x: string]: any;
    };
    constructor(quill: Quill, options: QuillOptionsStatic);
    extendToolbar(toolbar: any): void;
}
export {};

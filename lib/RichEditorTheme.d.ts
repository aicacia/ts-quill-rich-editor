import Quill from "quill";
import type { QuillOptionsStatic } from "quill";
import type { SnowTheme } from "quill/themes/snow";
declare const SnowThemeClass: typeof SnowTheme;
export declare class RichEditorTheme extends SnowThemeClass {
    static DEFAULTS: {
        [x: string]: any;
    };
    constructor(quill: Quill, options: QuillOptionsStatic);
    extendToolbar(toolbar: any): void;
}
export {};

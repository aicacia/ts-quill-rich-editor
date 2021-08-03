import Quill from "quill";
import type { QuillOptionsStatic } from "quill";
import type SnowThemeClass from "quill/themes/snow";
declare const SnowTheme: typeof SnowThemeClass;
export declare class RichEditorTheme extends SnowTheme {
    static DEFAULTS: {
        [x: string]: any;
    };
    constructor(quill: Quill, options: QuillOptionsStatic);
    extendToolbar(toolbar: any): void;
}
export {};

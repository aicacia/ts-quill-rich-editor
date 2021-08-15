import Quill from "quill";
import type Op from "quill-delta/dist/Op";
export declare function renderQuill(node: HTMLElement, quill: Quill): void;
export declare function renderOps(node: HTMLElement, ops: Op[]): void;

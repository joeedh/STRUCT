import * as struct_binpack from "./struct_binpack.js";
import * as struct_intern from "./struct_intern.js";
import type { Version } from "./types.js";
export declare function versionToInt(v: string | number[] | Version): number;
export declare function versionCoerce(v: string | number[] | Version): Version;
export declare function versionLessThan(a: string | number[] | Version, b: string | number[] | Version): boolean;
export declare class FileParams {
    magic: string;
    ext: string;
    blocktypes: string[];
    version: Version;
    constructor();
}
export declare class Block {
    type: string;
    data: unknown;
    constructor(type?: string, data?: unknown);
}
export declare class FileError extends Error {
}
export declare class FileHelper {
    version: Version;
    blocktypes: string[];
    magic: string;
    ext: string;
    struct: struct_intern.STRUCT | undefined;
    unpack_ctx: struct_binpack.unpack_context | undefined;
    blocks: Block[] | undefined;
    constructor(params?: Partial<FileParams>);
    read(dataview: DataView): Block[];
    doVersions(old: string | number[] | Version): void;
    write(blocks: Block[]): DataView;
    writeBase64(blocks: Block[]): string;
    makeBlock(type: string, data: unknown): Block;
    readBase64(base64: string): Block[];
}

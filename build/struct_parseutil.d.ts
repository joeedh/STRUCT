export declare class token {
    type: string;
    value: string;
    lexpos: number;
    lineno: number;
    col: number;
    lexer: lexer;
    parser: parser | undefined;
    constructor(type: string, val: string, lexpos: number, lineno: number, lex: lexer, p: parser | undefined, col: number);
    toString(): string;
}
export declare class tokdef {
    name: string;
    re: RegExp | undefined;
    reSticky: RegExp | undefined;
    func: ((t: token) => token | undefined) | undefined;
    example: string | undefined;
    constructor(name: string, regexpr?: RegExp, func?: (t: token) => token | undefined, example?: string);
}
export declare class PUTIL_ParseError extends Error {
    constructor(msg: string);
}
type StateEntry = [tokdef[], ((lexer: lexer) => boolean) | undefined];
export declare class lexer {
    tokdef: tokdef[];
    tokens: token[];
    lexpos: number;
    lexdata: string;
    colmap: number[] | undefined;
    lineno: number;
    printTokens: boolean;
    linestart: number;
    errfunc: ((lexer: lexer) => boolean) | undefined;
    linemap: number[] | undefined;
    tokints: Record<string, number>;
    statestack: [string, number][];
    states: Record<string, StateEntry>;
    statedata: number;
    peeked_tokens: token[];
    logger: (...args: unknown[]) => void;
    constructor(tokdefArr: tokdef[], errfunc?: (lexer: lexer) => boolean);
    add_state(name: string, tokdefArr: tokdef[], errfunc?: (lexer: lexer) => boolean): void;
    tok_int(_name: string): void;
    push_state(state: string, statedata: number): void;
    pop_state(): void;
    input(str: string): void;
    error(): void;
    peek(): token | undefined;
    peeknext(): token | undefined;
    at_end(): boolean;
    next(ignore_peek?: boolean): token | undefined;
}
export declare class parser {
    lexer: lexer;
    errfunc: ((token: token | undefined, msg: string) => void) | undefined;
    start: ((p: parser) => unknown) | undefined;
    logger: (...args: unknown[]) => void;
    constructor(lex: lexer, errfunc?: (token: token | undefined, msg: string) => void);
    parse(data?: string, err_on_unconsumed?: boolean): unknown;
    input(data: string): void;
    error(tokenObj: token | undefined, msg?: string): never;
    peek(): token | undefined;
    peeknext(): token | undefined;
    next(): token | undefined;
    optional(type: string): boolean;
    at_end(): boolean;
    expect(type: string, msg?: string): string;
}
export {};

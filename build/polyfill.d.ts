declare global {
    interface Array<T> {
        pop_i(idx: number): void;
        remove(item: T, suppress_error?: boolean): void;
    }
    interface String {
        contains(substr: string): boolean;
    }
}
export {};

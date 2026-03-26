import { describe, it, expect } from 'vitest';
import { encode_utf8, decode_utf8, test_utf8 } from '../src/struct_binpack.js';

describe('UTF-8 Encoding/Decoding', () => {
  it('should pass the built-in test', () => {
    expect(test_utf8()).toBe(true);
  });

  it('should handle ASCII strings', () => {
    const arr: number[] = [];
    encode_utf8(arr, "hello");
    const result = decode_utf8(arr);
    expect(result).toBe("hello");
  });

  it('should handle empty strings', () => {
    const arr: number[] = [];
    encode_utf8(arr, "");
    const result = decode_utf8(arr);
    expect(result).toBe("");
  });

  it('should handle unicode characters', () => {
    const original = "caf\u00E9"; // café
    const arr: number[] = [];
    encode_utf8(arr, original);
    const result = decode_utf8(arr);
    expect(result).toBe(original);
  });

  it('should handle special math symbols', () => {
    const original = "\u2260"; // ≠
    const arr: number[] = [];
    encode_utf8(arr, original);
    const result = decode_utf8(arr);
    expect(result).toBe(original);
  });

  it('should handle mixed ASCII and unicode', () => {
    const original = "a\u2260b";
    const arr: number[] = [];
    encode_utf8(arr, original);
    const result = decode_utf8(arr);
    expect(result).toBe(original);
  });
});

declare module 'pako' {
  interface DeflateOptions {
    level?: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  }

  type Data = Uint8Array | number[] | string
  export function deflate (data: Data, options: DeflateOptions): Uint8Array
  export function inflate (data: Uint8Array | number[] | string, options?: any): Uint8Array
}

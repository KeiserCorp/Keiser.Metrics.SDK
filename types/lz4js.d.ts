declare module "lz4js" {
  export function compress (buffer: Array<number> | Uint8Array): Array<number>
  export function decompress (buffer: Array<number> | Uint8Array): Array<number>
}
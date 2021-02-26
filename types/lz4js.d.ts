declare module "lz4js" {
  export function compress (buffer: Array | Uint8Array): Array
  export function decompress (buffer: Array | Uint8Array): Array
}
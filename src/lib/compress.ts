import { deflate } from 'pako'

export function compressDeflateToB64 (data: any) {
  const encodedData = new Uint8Array(Buffer.from(JSON.stringify(data)))
  const compressedData = deflate(encodedData, { level: 9 })
  return Buffer.from(compressedData).toString('base64')
}

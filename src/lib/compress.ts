import { compress } from 'lz4js'

export function compressLz4ToB64 (data: any) {
  const dataString = new TextEncoder().encode(JSON.stringify(data))
  const compressedFile = compress(dataString)
  return Buffer.from(compressedFile).toString('base64')
}

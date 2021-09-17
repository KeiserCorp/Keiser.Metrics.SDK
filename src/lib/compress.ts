import { deflate, inflate } from 'pako'

export function deflateToB64 (data: any) {
  const encodedData = new Uint8Array(Buffer.from(JSON.stringify(data)))
  const compressedData = deflate(encodedData, { level: 9 })
  return Buffer.from(compressedData).toString('base64')
}

export function inflateFromB64 (b64Data: string) {
  const bufferData = new Uint8Array(Buffer.from(b64Data, 'base64'))
  const inflatedData = inflate(bufferData)
  const jsonData = new TextDecoder('utf-8').decode(inflatedData)
  return JSON.parse(jsonData)
}

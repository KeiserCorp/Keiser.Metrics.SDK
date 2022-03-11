import { deflate, inflate } from 'pako'

import { KA5StrengthMachineDataSetData } from '../models/strengthMachineDataSet'

export function deflateToB64 (data: any) {
  const encodedData = new Uint8Array(Buffer.from(JSON.stringify(data)))
  const compressedData = deflate(encodedData, { level: 9 })
  return Buffer.from(compressedData).toString('base64')
}

export function inflateFromB64 (b64Data: string) {
  return inflateFromUint8Array(new Uint8Array(Buffer.from(b64Data, 'base64')))
}

export function inflateFromUint8Array (arrayData: Uint8Array) {
  const inflatedData = inflate(arrayData)
  const jsonData = new TextDecoder('utf-8').decode(inflatedData)
  return JSON.parse(jsonData)
}

export function decompressKA5FromBuffer (bufferData: Buffer) {
  const textDecoder = new TextDecoder('utf-8')
  const arrayData = new Uint8Array(bufferData)
  const magicNumber = textDecoder.decode(arrayData.slice(0, 6))
  switch (magicNumber) {
    case 'ka5.1!':
    default:
    {
      const inflatedData = inflate(arrayData.slice(6))
      const jsonData = textDecoder.decode(inflatedData)
      return JSON.parse(jsonData) as KA5StrengthMachineDataSetData
    }
  }
}

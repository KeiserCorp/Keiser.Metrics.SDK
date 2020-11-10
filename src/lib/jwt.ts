const atobImp = (str: string): string => {
  try {
    return atob(str)
  } catch (err) {
    return Buffer.from(str, 'base64').toString('binary')
  }
}

export const DecodeJWT = (token: string) => {
  let bodySeg = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  bodySeg = bodySeg.padEnd(bodySeg.length + (4 - (bodySeg.length % 4)), '=').replace(/====$/, '')
  return JSON.parse(decodeURIComponent(atobImp(bodySeg).replace(/(.)/g, m => {
    const code = m.charCodeAt(0).toString(16).toUpperCase()
    return `%${(code.length < 2 ? '0' : '')}${code}`
  })))
}

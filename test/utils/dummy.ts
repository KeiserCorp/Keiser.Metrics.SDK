export function randomCharacterSequence (length: number) {
  return [...Array(length)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
}

export function randomLetterSequence (length: number) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  return [...Array(length)].map(i => letters.charAt(Math.floor(Math.random() * letters.length))).join('')
}

export function randomNumberSequence (length: number) {
  return [...Array(length)].map(i => (~~(Math.random() * 10)).toString()).join('')
}

export function randomEmailAddress () {
  return randomCharacterSequence(50) + '@fake.com'
}

export function randomName () {
  return randomLetterSequence(12) + ' ' + randomLetterSequence(16)
}

export function randomEchipId () {
  return [...Array(14)].map(i => (~~(Math.random() * 16)).toString(16)).join('') + '0c'
}

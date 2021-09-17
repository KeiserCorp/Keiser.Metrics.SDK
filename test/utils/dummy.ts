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

export function randomByte () {
  return Math.floor(Math.random() * 255)
}

export function generateMSeriesDataSet () {
  const startTime = (new Date()).getTime()
  return [...new Array(1000)].map((v, index) => ({
    takenAt: new Date(startTime + (333 * index)),
    realTime: true,
    interval: 0,
    cadence: (Math.random() * 20) + 80,
    power: (Math.random() * 150) + 100,
    caloricBurn: (index / 10),
    duration: ((index / 3) * 1000) + 8000,
    distance: (index / 300),
    heartRate: 60 + (index % 100),
    gear: (Math.random() * 10) + 10
  }))
}

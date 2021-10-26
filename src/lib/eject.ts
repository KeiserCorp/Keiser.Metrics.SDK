export function eject<T> (source: T): T {
  return Array.isArray(source)
    ? source.map(item => eject(item))
    : source instanceof Date
      ? new Date(source.getTime())
      : typeof source === 'object'
        ? Object.getOwnPropertyNames(source).reduce((obj, property) => {
          obj[property] = eject((source as { [key: string]: any })[property])
          return obj
        }, Object.create(Object.getPrototypeOf(source)))
        : source
}

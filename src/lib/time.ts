const momentDurationRegex = /^P((?<days>\d+)D)?T?((?<hours>\d+)H)?((?<minutes>\d+)M)?((?<seconds>\d+)S)?$/

export const durationToSeconds = (duration: string): number => {
  let accumulated = 0
  const match = duration.match(momentDurationRegex)
  if (match !== null) {
    const groups = match.groups
    if (typeof groups !== 'undefined') {
      if (groups.days !== '') {
        accumulated += parseInt(groups.days, 10) * 86400
      }
      if (groups.hours !== '') {
        accumulated += parseInt(groups.hours, 10) * 3600
      }
      if (groups.minutes !== '') {
        accumulated += parseInt(groups.minutes, 10) * 60
      }
      if (groups.seconds !== '') {
        accumulated += parseInt(groups.seconds, 10)
      }
    }
  }

  return accumulated
}

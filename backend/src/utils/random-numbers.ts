export function generateTwoRandomNumbers(maxValue: number) {
  if (maxValue < 2) {
    throw new Error(
      "moviesQtd must be at least 2 to generate two different numbers."
    )
  }

  const first = Math.floor(Math.random() * maxValue) + 1
  let second: number

  do {
    second = Math.floor(Math.random() * maxValue) + 1
  } while (second === first)

  return [first, second]
}

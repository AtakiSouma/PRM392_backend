// utils.ts
export function generateOrderName(): string {
  const length = Math.floor(Math.random() * 7) + 1 // Random length between 1 and 7
  let orderName = ''
  for (let i = 0; i < length; i++) {
    orderName += Math.floor(Math.random() * 10) // Append random digit
  }
  return orderName
}

export default function generateRandomPhoneNumber() {
  const digits = '0123456789'
  let phoneNumber = '0' // Start with '0'
  for (let i = 0; i < 9; i++) {
    phoneNumber += digits[Math.floor(Math.random() * digits.length)]
  }
  return phoneNumber
}

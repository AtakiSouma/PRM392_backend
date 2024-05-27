export default function splitFullName(fullName: string) {
  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
  const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''

  return { firstName, middleName, lastName }
}

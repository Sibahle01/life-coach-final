// /src/app/(public)/book/flow/utils/formatting.ts
// EXACT formatting from your working system - ADDED missing exports

export const formatCurrency = (amount: number) => {
  return `R${amount.toFixed(2)}`
}

export const formatDateForDisplay = (dateString: string) => {
  const date = new Date(dateString + 'T12:00:00Z')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

// For calendar display
export const formatDateShort = (dateString: string) => {
  const date = new Date(dateString + 'T12:00:00Z')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

// 🔥 ADDED: Format time for display (e.g., "09:00" -> "9:00 AM")
export const formatTimeForDisplay = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

// 🔥 ADDED: Short time format (e.g., "09:00" -> "9AM")
export const formatShortTime = (timeStr: string) => {
  const [hours] = timeStr.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}${ampm}`
}
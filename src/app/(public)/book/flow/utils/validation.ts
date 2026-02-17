// /src/app/(public)/book/flow/utils/validation.ts
// Simple validation helpers

export const calculatePackagePrice = (
  singlePrice: number,
  sessions: number = 3,
  discount: number = 0
) => {
  const packagePrice = Number(singlePrice) * sessions
  const discountAmount = packagePrice * (Number(discount) / 100)
  return packagePrice - discountAmount
}
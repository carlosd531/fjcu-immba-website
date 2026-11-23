export const PLATFORM_FEE_RATE = 0.04
export const DELIVERY_FEE = 50

export function platformFee(itemTotal: number) {
  return Math.round(Math.max(0, itemTotal) * PLATFORM_FEE_RATE)
}

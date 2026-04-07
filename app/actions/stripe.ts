'use server'

import { stripe } from '@/lib/stripe'
import { TOKEN_PACKAGES, getTokenPackage } from '@/lib/products'

export async function startCheckoutSession(packageId: string) {
  const tokenPackage = getTokenPackage(packageId)
  if (!tokenPackage) {
    throw new Error(`Token package with id "${packageId}" not found`)
  }

  // Create Checkout Session for token purchase
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `ClawMint ${tokenPackage.name}`,
            description: tokenPackage.description,
          },
          unit_amount: tokenPackage.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      packageId: tokenPackage.id,
      tokenAmount: tokenPackage.tokenAmount.toString(),
    },
  })

  return session.client_secret
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    paymentStatus: session.payment_status,
    metadata: session.metadata,
  }
}

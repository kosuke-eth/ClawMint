export interface TokenPackage {
  id: string
  name: string
  description: string
  tokenAmount: number
  priceInCents: number
  popular?: boolean
}

// ClawMint Token Packages - AI Stable Tokens (AST)
// 1 AST = 1 USD equivalent for AI task payments
export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'ast-10',
    name: '10 AST',
    description: 'Starter pack - Perfect for trying out AI tasks',
    tokenAmount: 10,
    priceInCents: 1000, // $10.00
  },
  {
    id: 'ast-50',
    name: '50 AST',
    description: 'Standard pack - Great for regular AI usage',
    tokenAmount: 50,
    priceInCents: 5000, // $50.00
    popular: true,
  },
  {
    id: 'ast-100',
    name: '100 AST',
    description: 'Pro pack - Best value for power users',
    tokenAmount: 100,
    priceInCents: 9500, // $95.00 (5% discount)
  },
  {
    id: 'ast-500',
    name: '500 AST',
    description: 'Enterprise pack - Maximum AI potential',
    tokenAmount: 500,
    priceInCents: 45000, // $450.00 (10% discount)
  },
]

export function getTokenPackage(id: string): TokenPackage | undefined {
  return TOKEN_PACKAGES.find((p) => p.id === id)
}

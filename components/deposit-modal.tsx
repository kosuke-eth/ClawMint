"use client"

import { useState, useCallback, useEffect } from "react"
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { X, CreditCard, Coins, Check, Sparkles, Zap } from "lucide-react"
import { TOKEN_PACKAGES, type TokenPackage } from "@/lib/products"
import { startCheckoutSession, getCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type DepositMethod = "card" | "stablecoin"
type DepositStep = "select-method" | "select-package" | "checkout" | "success"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [step, setStep] = useState<DepositStep>("select-method")
  const [method, setMethod] = useState<DepositMethod | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null)
  const [stablecoinAmount, setStablecoinAmount] = useState("")

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("select-method")
      setMethod(null)
      setSelectedPackage(null)
      setStablecoinAmount("")
    }
  }, [isOpen])

  const handleMethodSelect = (selectedMethod: DepositMethod) => {
    setMethod(selectedMethod)
    setStep("select-package")
  }

  const handlePackageSelect = (pkg: TokenPackage) => {
    setSelectedPackage(pkg)
    if (method === "card") {
      setStep("checkout")
    }
  }

  const handleStablecoinDeposit = async () => {
    if (!selectedPackage) return
    try {
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedPackage.tokenAmount }),
      })
      const result = await response.json()
      
      if (result.success) {
        onSuccess()
        setStep("success")
      }
    } catch (error) {
      console.error("Deposit error:", error)
    }
  }

  const handleCheckoutComplete = useCallback(async () => {
    if (selectedPackage) {
      try {
        const response = await fetch("/api/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: selectedPackage.tokenAmount }),
        })
        const result = await response.json()
        
        if (result.success) {
          onSuccess()
          setStep("success")
        }
      } catch (error) {
        console.error("Checkout deposit error:", error)
      }
    }
  }, [selectedPackage, onSuccess])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl mx-4">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {step === "success" ? "Deposit Successful!" : "Deposit Tokens"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {step === "select-method" && "Choose your payment method"}
                {step === "select-package" && "Select a token package"}
                {step === "checkout" && "Complete your purchase"}
                {step === "success" && "Your tokens have been credited"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Payment Method */}
          {step === "select-method" && (
            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => handleMethodSelect("card")}
                className="group flex flex-col items-center gap-4 rounded-xl border-2 border-border bg-secondary/30 p-6 transition-all hover:border-primary hover:bg-secondary/50"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">Credit Card</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pay with Visa, Mastercard, or Amex via Stripe
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-success" />
                  <span>Instant deposit</span>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect("stablecoin")}
                className="group flex flex-col items-center gap-4 rounded-xl border-2 border-border bg-secondary/30 p-6 transition-all hover:border-primary hover:bg-secondary/50"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Coins className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">Stablecoin</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Deposit USDC or USDT from your wallet
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-success" />
                  <span>1:1 token conversion</span>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Select Package */}
          {step === "select-package" && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <button
                  onClick={() => setStep("select-method")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
              </div>
              
              {method === "card" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {TOKEN_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handlePackageSelect(pkg)}
                      className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-5 text-left transition-all hover:border-primary ${
                        pkg.popular 
                          ? "border-primary bg-primary/5" 
                          : "border-border bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                          Popular
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold text-foreground">{pkg.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">
                          ${(pkg.priceInCents / 100).toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">USD</span>
                      </div>
                      {pkg.tokenAmount !== pkg.priceInCents / 100 && (
                        <div className="text-xs text-success">
                          Save ${((pkg.tokenAmount - pkg.priceInCents / 100)).toFixed(2)}!
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {TOKEN_PACKAGES.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-5 text-left transition-all ${
                          selectedPackage?.id === pkg.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-secondary/30 hover:border-primary hover:bg-secondary/50"
                        }`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                            Popular
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-primary" />
                          <span className="text-xl font-bold text-foreground">{pkg.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-foreground">
                            {pkg.tokenAmount} USDC
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedPackage && (
                    <div className="mt-6 rounded-xl border border-border bg-secondary/30 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-muted-foreground">You will receive:</span>
                        <span className="text-xl font-bold text-foreground">
                          {selectedPackage.tokenAmount} AST
                        </span>
                      </div>
                      <p className="mb-4 text-xs text-muted-foreground">
                        Send {selectedPackage.tokenAmount} USDC to the wallet address below. 
                        For this demo, click the button to simulate the deposit.
                      </p>
                      <div className="mb-4 rounded-lg bg-input p-3 font-mono text-xs text-muted-foreground break-all">
                        0x742d35Cc6634C0532925a3b844Bc9e7595f...demo
                      </div>
                      <button
                        onClick={handleStablecoinDeposit}
                        className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Simulate Stablecoin Deposit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Stripe Checkout */}
          {step === "checkout" && selectedPackage && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <button
                  onClick={() => setStep("select-package")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
              </div>
              <div className="mb-4 rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{selectedPackage.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedPackage.description}</p>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    ${(selectedPackage.priceInCents / 100).toFixed(2)}
                  </p>
                </div>
              </div>
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ 
                  clientSecret: () => startCheckoutSession(selectedPackage.id),
                  onComplete: handleCheckoutComplete,
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && selectedPackage && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
                <Check className="h-10 w-10 text-success" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground">
                  {selectedPackage.tokenAmount} AST Credited!
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Your AI Stable Tokens have been added to your wallet
                </p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/30 p-4 text-center">
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-xs text-foreground">
                  {Date.now().toString(36).toUpperCase()}-AST-{selectedPackage.tokenAmount}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Continue to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

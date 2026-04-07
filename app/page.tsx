"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { WalletPanel } from "@/components/wallet-panel"
import { ChatPanel } from "@/components/chat-panel"
import { TransactionLog, type Transaction } from "@/components/transaction-log"
import { DepositModal } from "@/components/deposit-modal"
import { Zap, Shield, Activity } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Dashboard() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  
  const { data, error, mutate } = useSWR("/api/data", fetcher, {
    refreshInterval: 5000,
  })

  const handleDeposit = useCallback(
    async () => {
      // Refresh data after deposit is complete
      // The actual deposit API call happens in the modal
      mutate()
    },
    [mutate]
  )

  const handleTaskRequest = useCallback(
    async (task: string) => {
      try {
        const response = await fetch("/api/task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task }),
        })

        const result = await response.json()

        // Refresh data after task completion
        mutate()

        return result
      } catch (error) {
        return {
          success: false,
          message: "Failed to process task. Please try again.",
        }
      }
    },
    [mutate]
  )

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground">Please refresh the page</p>
        </div>
      </div>
    )
  }

  const wallet = data?.wallet || { balance: 0, spent: 0, blocked: 0 }
  const transactions: Transaction[] = data?.transactions || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ClawMint</h1>
              <p className="text-xs text-muted-foreground">AI Agent Autonomous Payment</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
              <span className="text-xs font-medium text-success">System Active</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground">Security Enabled</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{transactions.length}</span> Transactions
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="text-sm text-muted-foreground">
            Success Rate:{" "}
            <span className="font-medium text-success">
              {transactions.length > 0
                ? Math.round(
                    (transactions.filter((t) => t.status === "success").length /
                      transactions.length) *
                      100
                  )
                : 0}
              %
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="text-sm text-muted-foreground">
            Blocked:{" "}
            <span className="font-medium text-destructive">
              {transactions.filter((t) => t.status === "rejected").length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid h-[calc(100vh-220px)] grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Wallet Panel - Left */}
          <div className="lg:col-span-3">
            <WalletPanel
              balance={wallet.balance}
              spent={wallet.spent}
              blocked={wallet.blocked}
              onDeposit={() => setIsDepositModalOpen(true)}
            />
          </div>

          {/* Chat Panel - Center */}
          <div className="lg:col-span-5">
            <ChatPanel onTaskRequest={handleTaskRequest} />
          </div>

          {/* Transaction Log - Right */}
          <div className="lg:col-span-4">
            <TransactionLog transactions={transactions} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <p className="text-xs text-muted-foreground">
            ClawMint MVP Demo - AI Agent Autonomous Payment Infrastructure
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by <span className="text-primary">Supabase</span> + <span className="text-primary">Stripe</span>
          </p>
        </div>
      </footer>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={handleDeposit}
      />
    </div>
  )
}

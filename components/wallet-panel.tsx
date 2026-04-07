"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Wallet, Shield, Plus, Zap } from "lucide-react"

interface WalletPanelProps {
  balance: number
  spent: number
  blocked: number
  onDeposit?: () => void
}

export function WalletPanel({ balance, spent, blocked, onDeposit }: WalletPanelProps) {
  const total = balance + spent + blocked
  
  const data = [
    { name: "Available", value: balance, color: "#22d3ee" },
    { name: "Spent", value: spent, color: "#4ade80" },
    { name: "Blocked", value: blocked, color: "#f87171" },
  ]

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Wallet</h2>
          <p className="text-sm text-muted-foreground">Token Balance</p>
        </div>
      </div>

      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-xs font-medium text-primary">AI Stable Token (AST)</span>
        </div>
        <p className="mt-2 text-4xl font-bold text-foreground">{balance.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">AST Available</p>
      </div>

      {onDeposit && (
        <button
          onClick={onDeposit}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span>Deposit Tokens</span>
        </button>
      )}

      <div className="relative mx-auto mb-6 h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">${total.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#4ade80]" />
            <span className="text-sm text-muted-foreground">Spent</span>
          </div>
          <span className="text-sm font-medium text-foreground">${spent.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#f87171]" />
            <span className="text-sm text-muted-foreground">Blocked</span>
          </div>
          <span className="text-sm font-medium text-foreground">${blocked.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-6 text-xs text-muted-foreground">
        <Shield className="h-3 w-3" />
        <span>Protected by ClawMint Security</span>
      </div>
    </div>
  )
}

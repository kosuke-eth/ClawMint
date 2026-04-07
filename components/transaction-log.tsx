"use client"

import { CheckCircle, XCircle, Clock, History, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react"

export interface Transaction {
  id: string
  amount: number
  task_name: string
  status: "success" | "rejected" | "pending"
  created_at: string
}

interface TransactionLogProps {
  transactions: Transaction[]
}

export function TransactionLog({ transactions }: TransactionLogProps) {
  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />
    }
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    const baseClasses = "rounded-full px-2 py-0.5 text-xs font-medium"
    switch (status) {
      case "success":
        return `${baseClasses} bg-success/10 text-success`
      case "rejected":
        return `${baseClasses} bg-destructive/10 text-destructive`
      case "pending":
        return `${baseClasses} bg-warning/10 text-warning`
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    if (isToday) return "Today"
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Transaction Log</h2>
            <p className="text-sm text-muted-foreground">Recent Activity</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {transactions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <History className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground">
              Start a task to see activity here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {tx.task_name.includes("Deposit") ? (
                      <Plus className="h-4 w-4 text-success" />
                    ) : (
                      getStatusIcon(tx.status)
                    )}
                    <span className={tx.task_name.includes("Deposit") 
                      ? "rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
                      : getStatusBadge(tx.status)
                    }>
                      {tx.task_name.includes("Deposit") ? "Deposit" : tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {tx.task_name.includes("Deposit") ? (
                      <Plus className="h-3 w-3 text-success" />
                    ) : tx.status === "rejected" ? (
                      <ArrowDownLeft className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        tx.task_name.includes("Deposit")
                          ? "text-success"
                          : tx.status === "rejected"
                          ? "text-destructive line-through"
                          : tx.status === "pending"
                          ? "text-warning"
                          : "text-foreground"
                      }`}
                    >
                      {tx.task_name.includes("Deposit") ? "+" : "-"}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="mb-2 text-sm text-foreground">{tx.task_name}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(tx.created_at)}</span>
                  <span>{formatTime(tx.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {transactions.filter((t) => t.status === "success").length} successful
          </span>
          <span className="text-destructive">
            {transactions.filter((t) => t.status === "rejected").length} blocked
          </span>
        </div>
      </div>
    </div>
  )
}

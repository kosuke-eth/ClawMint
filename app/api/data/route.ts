import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get demo wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", "demo-user")
      .single()

    if (walletError) {
      console.error("Wallet error:", walletError)
      return NextResponse.json(
        { error: "Failed to fetch wallet data" },
        { status: 500 }
      )
    }

    // Get transactions
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("wallet_id", wallet?.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (txError) {
      console.error("Transaction error:", txError)
    }

    // Calculate spent and blocked amounts
    const spent = transactions
      ?.filter((t) => t.status === "success")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const blocked = transactions
      ?.filter((t) => t.status === "rejected")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    return NextResponse.json({
      wallet: {
        balance: Number(wallet?.balance) || 0,
        spent,
        blocked,
      },
      transactions: transactions || [],
    })
  } catch (error) {
    console.error("Data fetch error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching data" },
      { status: 500 }
    )
  }
}

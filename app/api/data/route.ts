import { NextResponse } from "next/server"
import { createWalletIfMissing, getRecentTransactions } from "@/lib/tidb"

export async function GET() {
  try {
    const userId = "demo-user"
    const wallet = await createWalletIfMissing(userId)

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: "Wallet not found" },
        { status: 404 }
      )
    }

    const transactions = await getRecentTransactions(wallet.id, 20)

    const spent = transactions
      .filter((tx) => tx.status === "success" && tx.amount > 0)
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    const blocked = transactions.filter((tx) => tx.status === "rejected").length

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        user_id: wallet.user_id,
        balance: Number(wallet.balance),
        spent,
        blocked,
      },
      transactions,
    })
  } catch (error) {
    console.error("Data fetch error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching wallet data",
      },
      { status: 500 }
    )
  }
}
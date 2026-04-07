import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()
    
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid deposit amount" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get demo wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", "demo-user")
      .single()

    if (walletError || !wallet) {
      return NextResponse.json(
        { success: false, message: "Wallet not found" },
        { status: 404 }
      )
    }

    // Update wallet balance
    const newBalance = Number(wallet.balance) + amount

    const { error: updateError } = await supabase
      .from("wallets")
      .update({ 
        balance: newBalance, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", wallet.id)

    if (updateError) {
      return NextResponse.json(
        { success: false, message: "Failed to process deposit" },
        { status: 500 }
      )
    }

    // Log deposit transaction
    await supabase.from("transactions").insert({
      wallet_id: wallet.id,
      amount: amount,
      task_name: `Token Deposit: +${amount} AST`,
      status: "success",
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deposited ${amount} AST tokens!`,
      newBalance,
    })
  } catch (error) {
    console.error("Deposit error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while processing the deposit" },
      { status: 500 }
    )
  }
}

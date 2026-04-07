import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Simple task cost estimation based on task type keywords
function estimateTaskCost(taskDescription: string): { cost: number; taskType: string } {
  const lowerDesc = taskDescription.toLowerCase()
  
  if (lowerDesc.includes("research") || lowerDesc.includes("search") || lowerDesc.includes("find")) {
    return { cost: 5.0, taskType: "Web Research" }
  }
  if (lowerDesc.includes("analyze") || lowerDesc.includes("analysis") || lowerDesc.includes("report")) {
    return { cost: 8.0, taskType: "Data Analysis" }
  }
  if (lowerDesc.includes("write") || lowerDesc.includes("content") || lowerDesc.includes("create")) {
    return { cost: 3.5, taskType: "Content Creation" }
  }
  if (lowerDesc.includes("translate") || lowerDesc.includes("translation")) {
    return { cost: 2.0, taskType: "Translation" }
  }
  if (lowerDesc.includes("competitor") || lowerDesc.includes("market")) {
    return { cost: 6.0, taskType: "Market Analysis" }
  }
  
  // Default cost for unrecognized tasks
  return { cost: 4.0, taskType: "General Task" }
}

// Security check - block suspicious patterns
function isSuspiciousTask(taskDescription: string): boolean {
  const lowerDesc = taskDescription.toLowerCase()
  const suspiciousPatterns = [
    "transfer all",
    "withdraw",
    "send money",
    "empty wallet",
    "drain",
    "hack",
    "steal",
    "unauthorized",
  ]
  
  return suspiciousPatterns.some((pattern) => lowerDesc.includes(pattern))
}

export async function POST(request: Request) {
  try {
    const { task } = await request.json()
    
    if (!task || typeof task !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid task description" },
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
        { success: false, message: "Wallet not found. Please refresh the page." },
        { status: 404 }
      )
    }

    // Check for suspicious activity
    if (isSuspiciousTask(task)) {
      // Log blocked transaction
      await supabase.from("transactions").insert({
        wallet_id: wallet.id,
        amount: 0,
        task_name: `BLOCKED: ${task}`,
        status: "rejected",
      })

      return NextResponse.json({
        success: false,
        message: "This request has been blocked by ClawMint Security. Suspicious activity detected.",
        blocked: true,
      })
    }

    // Estimate cost
    const { cost, taskType } = estimateTaskCost(task)

    // Check balance
    if (wallet.balance < cost) {
      await supabase.from("transactions").insert({
        wallet_id: wallet.id,
        amount: cost,
        task_name: `${taskType}: ${task.substring(0, 50)}`,
        status: "rejected",
      })

      return NextResponse.json({
        success: false,
        message: `Insufficient balance. This task costs $${cost.toFixed(2)} but you only have $${wallet.balance.toFixed(2)} available.`,
        cost,
      })
    }

    // Process payment
    const newBalance = Number(wallet.balance) - cost

    // Update wallet balance
    const { error: updateError } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id)

    if (updateError) {
      return NextResponse.json(
        { success: false, message: "Failed to process payment" },
        { status: 500 }
      )
    }

    // Log successful transaction
    await supabase.from("transactions").insert({
      wallet_id: wallet.id,
      amount: cost,
      task_name: `${taskType}: ${task.substring(0, 50)}`,
      status: "success",
    })

    return NextResponse.json({
      success: true,
      message: `Task "${taskType}" has been executed successfully! $${cost.toFixed(2)} has been charged to your wallet. Your new balance is $${newBalance.toFixed(2)}.`,
      cost,
      newBalance,
    })
  } catch (error) {
    console.error("Task processing error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while processing the task" },
      { status: 500 }
    )
  }
}

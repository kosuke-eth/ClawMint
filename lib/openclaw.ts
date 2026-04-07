export type OpenClawInput = {
  message: string
  balance: number
  recentTransactions?: Array<{
    task_name?: string
    amount?: number
    status?: string
  }>
}

export type OpenClawResult = {
  summary: string
  estimatedCost: number
  auditStatus: "safe" | "warning" | "blocked"
  advice: string
  action: "proceed" | "deposit_required" | "blocked"
  source: "openclaw" | "fallback"
}

function fallbackEstimate(message: string): number {
  const lower = message.toLowerCase()

  if (
    lower.includes("research") ||
    lower.includes("search") ||
    lower.includes("find")
  ) {
    return 5
  }

  if (
    lower.includes("audit") ||
    lower.includes("analyze") ||
    lower.includes("analysis") ||
    lower.includes("report")
  ) {
    return 8
  }

  if (
    lower.includes("buy") ||
    lower.includes("purchase") ||
    lower.includes("nft")
  ) {
    return 12
  }

  if (
    lower.includes("write") ||
    lower.includes("content") ||
    lower.includes("create")
  ) {
    return 4
  }

  return 4
}

function buildFallbackResult(input: OpenClawInput): OpenClawResult {
  const estimatedCost = fallbackEstimate(input.message)
  const insufficient = estimatedCost > input.balance

  return {
    summary: `OpenClaw reviewed your request: "${input.message}".`,
    estimatedCost,
    auditStatus: insufficient ? "warning" : "safe",
    advice: insufficient
      ? "Balance is insufficient. Please deposit before proceeding."
      : "Balance is sufficient. You can proceed.",
    action: insufficient ? "deposit_required" : "proceed",
    source: "fallback",
  }
}

function parseAuditStatus(value: unknown): OpenClawResult["auditStatus"] {
  if (value === "blocked" || value === "warning" || value === "safe") {
    return value
  }
  return "safe"
}

export async function askOpenClaw(
  input: OpenClawInput
): Promise<OpenClawResult> {
  const baseUrl = process.env.OPENCLAW_BASE_URL
  const apiKey = process.env.OPENCLAW_API_KEY

  if (!baseUrl) {
    return buildFallbackResult(input)
  }

  try {
    const prompt = `
You are Agnes Claw, the AI purchase assistant for ClawMint.

Your role:
- review a purchase or task request
- estimate cost
- warn if the request looks risky or expensive
- explain whether the current balance is enough

User request:
${input.message}

Current balance:
${input.balance}

Recent transactions:
${JSON.stringify(input.recentTransactions ?? [])}

Return JSON only with this exact shape:
{
  "summary": "short review summary",
  "estimatedCost": 0,
  "auditStatus": "safe",
  "advice": "short advice"
}
`.trim()

    const res = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        message: prompt,
        balance: input.balance,
        recentTransactions: input.recentTransactions ?? [],
      }),
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error(`OpenClaw request failed: ${res.status}`)
    }

    const data = await res.json()
    const fallback = buildFallbackResult(input)

    const summary =
      typeof data.summary === "string"
        ? data.summary
        : typeof data.message === "string"
          ? data.message
          : fallback.summary

    const estimatedCost = Number(
      data.estimatedCost ?? fallback.estimatedCost
    )

    const auditStatus = parseAuditStatus(data.auditStatus)

    const advice =
      typeof data.advice === "string" ? data.advice : fallback.advice

    return {
      summary,
      estimatedCost,
      auditStatus,
      advice,
      action:
        auditStatus === "blocked"
          ? "blocked"
          : estimatedCost > input.balance
            ? "deposit_required"
            : "proceed",
      source: "openclaw",
    }
  } catch (error) {
    console.error("askOpenClaw error:", error)
    return buildFallbackResult(input)
  }
}
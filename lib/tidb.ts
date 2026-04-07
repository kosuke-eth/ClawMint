import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    const uri = process.env.TIDB_DATABASE_URL

    if (!uri) {
      throw new Error("TIDB_DATABASE_URL is not set")
    }

    pool = mysql.createPool({
      uri,
      connectionLimit: 5,
    })
  }

  return pool
}

export type WalletRow = {
  id: number
  user_id: string
  balance: number
  updated_at?: string
}

export type TransactionInput = {
  wallet_id: number
  amount: number
  task_name: string
  status: string
}

export type TransactionRow = {
  id: number
  wallet_id: number
  amount: number
  task_name: string
  status: string
  created_at?: string
}

export async function getWalletByUserId(
  userId: string
): Promise<WalletRow | null> {
  const db = getPool()

  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT id, user_id, balance, updated_at FROM wallets WHERE user_id = ? LIMIT 1",
    [userId]
  )

  if (!rows.length) {
    return null
  }

  return {
    id: Number(rows[0].id),
    user_id: String(rows[0].user_id),
    balance: Number(rows[0].balance),
    updated_at: rows[0].updated_at,
  }
}

export async function createWalletIfMissing(
  userId: string
): Promise<WalletRow | null> {
  const existing = await getWalletByUserId(userId)
  if (existing) {
    return existing
  }

  const db = getPool()

  await db.query(
    "INSERT INTO wallets (user_id, balance, updated_at) VALUES (?, ?, NOW())",
    [userId, 0]
  )

  return getWalletByUserId(userId)
}

export async function updateWalletBalance(
  walletId: number,
  newBalance: number
) {
  const db = getPool()

  await db.query(
    "UPDATE wallets SET balance = ?, updated_at = NOW() WHERE id = ?",
    [newBalance, walletId]
  )
}

export async function addTransaction(input: TransactionInput) {
  const db = getPool()

  await db.query(
    "INSERT INTO transactions (wallet_id, amount, task_name, status, created_at) VALUES (?, ?, ?, ?, NOW())",
    [input.wallet_id, input.amount, input.task_name, input.status]
  )
}

export async function getRecentTransactions(
  walletId: number,
  limit = 5
): Promise<TransactionRow[]> {
  const db = getPool()

  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT id, wallet_id, amount, task_name, status, created_at FROM transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT ?",
    [walletId, limit]
  )

  return rows.map((row) => ({
    id: Number(row.id),
    wallet_id: Number(row.wallet_id),
    amount: Number(row.amount),
    task_name: String(row.task_name),
    status: String(row.status),
    created_at: row.created_at,
  }))
}
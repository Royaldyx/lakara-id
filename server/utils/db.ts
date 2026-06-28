import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export function getDb(): mysql.Pool {
  if (!pool) {
    const config = useRuntimeConfig()
    pool = mysql.createPool({
      host:               (config.dbHost as string)  || 'localhost',
      port:               Number(config.dbPort as string) || 3306,
      user:               config.dbUser as string,
      password:           config.dbPass as string,
      database:           config.dbName as string,
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0,
      charset:            'utf8mb4',
      timezone:           '+00:00',
    })
  }
  return pool
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await getDb().execute(sql, params)
  return rows as T[]
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

export async function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
  const [result] = await getDb().execute(sql, params)
  return result as mysql.ResultSetHeader
}

/** Helper query terikat ke satu koneksi transaksi. */
export interface Tx {
  execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader>
  query<T = any>(sql: string, params?: any[]): Promise<T[]>
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>
}

/**
 * Jalankan callback dalam satu transaksi. Auto COMMIT jika sukses,
 * ROLLBACK + throw jika gagal. Koneksi selalu di-release.
 */
export async function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const conn = await getDb().getConnection()
  try {
    await conn.beginTransaction()
    const tx: Tx = {
      async execute(sql, params) {
        const [r] = await conn.execute(sql, params)
        return r as mysql.ResultSetHeader
      },
      async query<R = any>(sql: string, params?: any[]) {
        const [rows] = await conn.execute(sql, params)
        return rows as R[]
      },
      async queryOne<R = any>(sql: string, params?: any[]) {
        const [rows] = await conn.execute(sql, params)
        return ((rows as R[])[0] ?? null) as R | null
      },
    }
    const result = await fn(tx)
    await conn.commit()
    return result
  } catch (e) {
    try { await conn.rollback() } catch { /* ignore */ }
    throw e
  } finally {
    conn.release()
  }
}

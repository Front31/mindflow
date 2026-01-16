import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

// Vercel/Neon envs (Vercel Storage usually provides DATABASE_URL)
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  "";

if (!connectionString) {
  throw new Error(
    "Missing DATABASE_URL (or POSTGRES_URL). Connect Neon DB to the project and ensure env vars are set."
  );
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// GET latest room state
export async function GET(
  _req: Request,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `select id, state, rev, updated_at from rooms where id = $1`,
      [roomId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ id: roomId, state: null, rev: 0 });
    }

    return NextResponse.json(rows[0]);
  } finally {
    client.release();
  }
}

// PUT save room state (last-write-wins, bumps rev)
export async function PUT(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;
  const body = await req.json(); // { state, rev? }

  const nextState = body.state;
  if (!nextState) {
    return NextResponse.json({ ok: false, error: "Missing state" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `
      insert into rooms (id, state, rev)
      values ($1, $2::jsonb, 1)
      on conflict (id) do update
        set state = excluded.state,
            rev = rooms.rev + 1,
            updated_at = now()
      returning rev
      `,
      [roomId, JSON.stringify(nextState)]
    );

    return NextResponse.json({ ok: true, rev: rows[0]?.rev ?? 0 });
  } finally {
    client.release();
  }
}

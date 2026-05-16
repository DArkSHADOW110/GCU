import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/response";
import * as jarsRepo from "@/lib/repositories/jars";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  return withAuth(async (user) => {
    if (body.fund_amount) {
      const jar = await jarsRepo.fundJar(user.id, params.id, Number(body.fund_amount));
      if (!jar) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return { jar };
    }
    const jar = await jarsRepo.updateJar(user.id, params.id, body);
    if (!jar) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return { jar };
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (user) => {
    await jarsRepo.deleteJar(user.id, params.id);
    return { ok: true };
  });
}

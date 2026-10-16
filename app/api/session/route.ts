import { NextResponse } from "next/server";
import { WORKSPACE_COOKIE } from "@/lib/session";

/** DELETE /api/session — sign out of the workspace. */
export async function DELETE() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(WORKSPACE_COOKIE);
  return response;
}

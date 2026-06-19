import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDataSource } from "@/server/db/data-source";
import { User } from "@/server/db/entities/User";
import { ok } from "@/server/lib/response";
import { signAccessToken, signRefreshToken } from "@/server/lib/jwt";
import { AppError } from "@/server/lib/app-error";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const ds = await getDataSource();
    const repo = ds.getRepository(User);
    const user = await repo.findOne({ where: { email: body.email } });
    const valid =
      user != null && (await bcrypt.compare(body.password, user.password));
    if (!user || !valid)
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    if (user.role !== "doctor" && user.role !== "admin")
      throw new AppError(
        "Only doctor and admin accounts can sign in",
        403,
        "FORBIDDEN",
      );
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId,
    } as const;
    return ok({
      user: payload,
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    });
  } catch (e) {
    return handleError(e);
  }
}

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getLicenses, updateLicenseStatus } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  licenses: router({
    list: publicProcedure.query(async () => {
      return getLicenses();
    }),
    approve: protectedProcedure
      .input(z.object({ deviceCode: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        const success = await updateLicenseStatus(input.deviceCode, "approved");
        return { success };
      }),
    revoke: protectedProcedure
      .input(z.object({ deviceCode: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        const success = await updateLicenseStatus(input.deviceCode, "revoked");
        return { success };
      }),
  }),
});

export type AppRouter = typeof appRouter;

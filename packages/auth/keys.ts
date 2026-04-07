import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const keys = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
  },
  runtimeEnv: process.env,
});

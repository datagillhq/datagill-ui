import "server-only";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { organization } from "better-auth/plugins/organization";
import { PostgresDialect } from "kysely";
import pg from "pg";
import { keys } from "./keys";

export const auth = betterAuth({
  database: new PostgresDialect({
    pool: new pg.Pool({ connectionString: keys.DATABASE_URL }),
  }),
  secret: keys.BETTER_AUTH_SECRET,
  baseURL: keys.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization(),
    jwt({
      jwks: {
        keyPairConfig: { alg: "RS256" },
        jwksPath: "/.well-known/jwks.json",
      },
      jwt: {
        expirationTime: "15m",
        definePayload: ({ session, user }) => ({
          userId: user.id,
          organizationId: session.activeOrganizationId ?? null,
        }),
      },
    }),
  ],
});

export type Auth = typeof auth;

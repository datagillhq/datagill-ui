import "server-only";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { organization } from "better-auth/plugins/organization";
import { PostgresDialect } from "kysely";
import pg from "pg";
import { keys } from "./keys";

// Singleton pool — avoids creating a new connection pool on every hot-reload
// in dev, which would exhaust Postgres max_connections.
const pool = new pg.Pool({ connectionString: keys.DATABASE_URL });

export const auth = betterAuth({
  database: new PostgresDialect({ pool }),
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
        // datagill-core fetches JWKS from AUTH_URL + "/.well-known/jwks.json"
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

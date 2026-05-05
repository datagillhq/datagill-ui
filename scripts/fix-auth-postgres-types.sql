ALTER TABLE "user"
  ALTER COLUMN "emailVerified" TYPE boolean USING ("emailVerified"::boolean),
  ALTER COLUMN "createdAt" TYPE timestamptz USING ("createdAt"::timestamptz),
  ALTER COLUMN "updatedAt" TYPE timestamptz USING ("updatedAt"::timestamptz);
ALTER TABLE session
  ALTER COLUMN "createdAt" TYPE timestamptz USING ("createdAt"::timestamptz),
  ALTER COLUMN "updatedAt" TYPE timestamptz USING ("updatedAt"::timestamptz),
  ALTER COLUMN "expiresAt" TYPE timestamptz USING ("expiresAt"::timestamptz);
ALTER TABLE account
  ALTER COLUMN "createdAt" TYPE timestamptz USING ("createdAt"::timestamptz),
  ALTER COLUMN "updatedAt" TYPE timestamptz USING ("updatedAt"::timestamptz),
  ALTER COLUMN "accessTokenExpiresAt" TYPE timestamptz USING ("accessTokenExpiresAt"::timestamptz),
  ALTER COLUMN "refreshTokenExpiresAt" TYPE timestamptz USING ("refreshTokenExpiresAt"::timestamptz);
ALTER TABLE verification
  ALTER COLUMN "createdAt" TYPE timestamptz USING ("createdAt"::timestamptz),
  ALTER COLUMN "updatedAt" TYPE timestamptz USING ("updatedAt"::timestamptz),
  ALTER COLUMN "expiresAt" TYPE timestamptz USING ("expiresAt"::timestamptz);
ALTER TABLE organization ALTER COLUMN "createdAt" TYPE timestamptz USING ("createdAt"::timestamptz);
ALTER TABLE member ALTER COLUMN "createdAt" TYPE timestamptz USING ("createdAt"::timestamptz);
ALTER TABLE invitation ALTER COLUMN "expiresAt" TYPE timestamptz USING ("expiresAt"::timestamptz);

# Contributing to @mech/auth

## Development Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Build the package:
   ```bash
   npm run build
   ```

3. Output appears in `dist/`.

## Code Quality

- Follow the existing code style (TypeScript, ESM).
- Keep modules small and focused.
- Prefer clarity over cleverness.
- Add JSDoc comments for public APIs.

## Testing

To test locally:

1. Set up a test Mech app with credentials.
2. Create a `.env.local` file:
   ```
   MECH_STORAGE_BASE_URL=https://storage.mechdna.net
   MECH_APP_ID=<your-test-app-uuid>
   MECH_APP_SCHEMA_ID=<your-test-schema-id>
   MECH_API_KEY=<your-test-api-key>
   BETTER_AUTH_SECRET=test-secret-123456789
   ```

3. Use the package in a local Next.js or Vite app by pointing to this repo.

## Submitting Changes

1. Create a feature branch.
2. Make your changes.
3. Ensure TypeScript compiles without errors.
4. Submit a PR with a clear description.

## Known Limitations

- Transactions are currently no-ops (Mech's HTTP SQL endpoint auto-commits).
- Streaming is not yet implemented.

These can be addressed in future iterations if needed.

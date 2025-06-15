# Backend Manual Testing

Automated integration tests that simulate complete gameplay scenarios against the live backend API.

## Prerequisites

1. **Backend server running** on port 3000:

   ```bash
   cd backend
   npm run dev
   ```

2. **Database running** with proper connection string in `.env`

## Running Tests

```bash
# From backend directory
npx tsx test/manual/run-all-tests.ts
```

### With verbose output:

```bash
VERBOSE=true npx tsx test/manual/run-all-tests.ts
```

## Adding New Test Scenarios

Edit `test/manual/test-scenarios.ts` and add your scenario:

```typescript
export const myCustomScenario: TestScenario = {
  name: "My Custom Test",
  description: "Tests my new feature",
  playerCount: 2,
  maxTurns: 30,
  expectedOutcome: "win",
};
```

Then add it to the scenarios array in `run-all-tests.ts`:

```typescript
const scenarios = [
  existingScenario1,
  existingScenario2,
  myCustomScenario, // Add your new scenario here
];
```

## What the tests do

- Create guest users with cookie authentication
- Start games and simulate realistic gameplay
- Test strategic card selection and game completion
- Validate API responses and game state transitions

## Troubleshooting

- **401 errors**: Check that your backend auth/CORS is configured properly
- **Database errors**: Verify PostgreSQL is running and accessible
- **TypeScript errors**: Run `npm run build` to check compilation

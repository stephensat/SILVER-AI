# SILVER-AI — Family finances

A responsive personal and family spending dashboard, starting with MYR and manual entry. No account or external API is required.

## Run

Requires Python 3 and Node.js 18+ for tests. No dependency installation is needed.

```sh
cd /workspace/SILVER-AI
npm start
```

The HTTP server listens on port 8000. For hosting on an iPad, deploy these static files to an HTTPS static hosting provider. Cloud workspace startup does not publish the application.

```sh
npm test
```

## Features

- Monthly income, expenses, remaining income, and savings rate
- Category spending, family member and month filters
- Monthly family spending budget and remaining allowance
- Manual transactions with delete confirmation
- JSON backup export and validated restore (replaces existing records after confirmation)
- Currency selection; amounts are not converted

## Data and limitations

The dashboard starts empty. All figures derive from the transactions you enter; budget limits are user-entered targets. Remaining income is recorded income minus recorded expenses, not a bank balance or net worth. Savings rate is remaining income divided by income and is unavailable when income is zero.

Records are saved in browser localStorage for the current website address. They are not encrypted, synced, or backed up automatically. Other users of the same browser profile may access them. Clearing website data removes records. Export backups regularly and keep them private. Currency changes only relabel existing values. No bank integrations, debt tracking, or multi-device family sync are included in this first version.

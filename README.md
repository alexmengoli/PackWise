# PackWise

PackWise is an offline-first packing organizer built as a pnpm monorepo.

## Workspace

- `apps/client`: plain Angular client application.
- `packages/shared`: shared TypeScript models and framework-independent domain utilities.

## Documentation

- [Project status](docs/project-status.md): product overview, current scope, MVP notes, and future ideas.

## Commands

```sh
pnpm install
pnpm start
pnpm build
pnpm lint
```

Core app functionality must remain local-first and usable without an account.

# Contributing

Thank you for contributing to `pi-openspec-status`.

## Before opening a change

- Search existing issues and pull requests before starting work.
- For a security concern, follow [SECURITY.md](SECURITY.md) rather than opening a public issue.
- Keep changes focused and include tests when behavior changes.
- Do not commit secrets, private contact information, generated credentials, or dependency directories.

## Local validation

Use Node.js 24 (the version used by the release workflow), then run:

```bash
npm ci --ignore-scripts
npm run typecheck
npm run lint
npm test
```

## Pull requests

Use the pull-request template to describe the change, validation performed, and any security or release impact. Maintainers may request focused follow-up changes or additional tests before merging.

## Code of conduct

Be respectful, constructive, and professional in issues, pull requests, and reviews.

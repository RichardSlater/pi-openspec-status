## ADDED Requirements

### Requirement: Credential-isolated package publication
The release workflow SHALL run dependency installation, tests, package inspection, and package creation in a job without npm OIDC publishing permission. Only the job that invokes `npm publish` SHALL receive `id-token: write`.

#### Scenario: Build dependency executes during installation
- **WHEN** a dependency lifecycle script executes during the build job
- **THEN** that job SHALL not have npm publishing OIDC permission

#### Scenario: Publishing a release artifact
- **WHEN** a version tag triggers package publication
- **THEN** the publish job SHALL publish the validated package artifact produced by the unprivileged build job

### Requirement: Immutable release actions and metadata validation
The release workflow SHALL pin third-party GitHub Actions to immutable commit references and SHALL verify that the release tag, package version, lockfile version, and packed package contents are consistent before publication.

#### Scenario: Mismatched release tag
- **WHEN** the version derived from the release tag does not match the package metadata selected for publication
- **THEN** the workflow SHALL fail before `npm publish` is invoked

#### Scenario: Unexpected package contents
- **WHEN** package-content inspection finds files outside the approved publication set
- **THEN** the workflow SHALL fail before publication
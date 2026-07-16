# Maintainer security settings

Version-controlled files cannot enable GitHub repository settings. A repository administrator must review this checklist after merging the governance and workflow configuration, and whenever GitHub changes the available controls.

## Branch rules

For the default protected branch, require pull requests and require the **Verify** workflow status check before merge. Require review from [CODEOWNERS](CODEOWNERS) where available, block force pushes and branch deletion, and restrict direct pushes to trusted maintainers.

## Vulnerability reporting and alerts

- Enable private vulnerability reporting so the [security policy](../SECURITY.md) reporting path is available.
- Enable Dependabot alerts and security updates where available; triage alerts promptly and record the decision in the related pull request or issue.
- Enable secret scanning and push protection where available. Never add credentials, tokens, or private contact details to this repository.
- Enable GitHub code scanning so CodeQL SARIF results can be reviewed and triaged.

## Workflow review

Keep GitHub Actions dependency updates enabled in Dependabot. Review every proposed action revision before merging, preserve immutable full-SHA pins, and do not grant write permissions or repository secrets to pull-request validation workflows.

## Periodic review

Review the Scorecard results, CodeQL findings, Dependabot activity, and branch rules at least quarterly. Update this document only to describe settings that are actually available and enabled for the repository.

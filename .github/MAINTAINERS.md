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

## Scorecard limitations for a single-maintainer project

The branch safeguards documented above—pull requests, the required **Verify** status check, CODEOWNERS review where available, and prevention of force pushes and branch deletion—remain important protections. They do not, by themselves, provide evidence of independent review when the project has only one active maintainer. Do not claim that version-controlled configuration resolves Scorecard findings for independent approval history or stricter branch-review controls.

If sufficient independent maintainers become available, reassess whether to require independent approvals, enforce CODEOWNERS review, dismiss stale approvals, and require approval after the last push before changing repository rules. Do not enable nominal requirements that the lone maintainer would routinely bypass.

## Scorecard reassessment record

- **Owner:** richards-ensono
- **Post-90-day Maintained review date:** 2026-07-30
- At that review, assess the repository-age **Maintained** Scorecard result and record whether it is now eligible to resolve.
- OpenSSF Best Practices enrollment is optional. The owner will decide whether to create and staff a separate governance initiative when independent maintenance capacity is available.

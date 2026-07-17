## ADDED Requirements

### Requirement: Authoritative MIT license artifact
The repository SHALL publish a root-level `LICENSE` file containing the standard MIT license text and a maintainer-confirmed copyright notice. The license artifact SHALL be consistent with the MIT license declaration in package metadata and project documentation.

#### Scenario: A consumer inspects repository licensing
- **WHEN** a consumer or hosting-platform license detector examines the repository root
- **THEN** it finds the `LICENSE` artifact
- **AND** it can identify the project as MIT licensed without relying on package metadata alone

#### Scenario: License attribution is prepared for publication
- **WHEN** the license file is created or updated
- **THEN** its copyright holder and year or year range are confirmed by a maintainer
- **AND** the implementation does not infer that legal attribution from unrelated metadata

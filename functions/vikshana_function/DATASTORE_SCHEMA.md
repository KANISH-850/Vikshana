# Required Catalyst Data Store tables — Investigation Copilot

This repo has no schema-as-code for Data Store tables (the existing `CaseMaster`,
`CaseCategory`, `ArrestSurrender`, `Victim` tables were created manually in the
Catalyst Console). The tables below must be created the same way — via the
Catalyst Console (or `catalyst functions:deploy`-adjacent Data Store tooling if
your org uses it) — **before** running `scripts/seedInvestigationData.js` or
using any of the new `/conversations`, `/cases/:caseId/*` endpoints. This
document is the source of truth for exact table/column names; the code in
`queries/`, `services/`, and `routes/` assumes these names verbatim.

Every new table (except `Conversation`, `Message`, `InvestigationMemory`,
`Attachment`) carries a `case_id` column that is an application-level
reference to `CaseMaster.ROWID` — Catalyst Data Store has no enforced FK, so
this is convention-only, matching how `Victim`/`ArrestSurrender` already
relate to `CaseMaster` in the existing code.

Every table automatically gets `ROWID`, `CREATORID`, `CREATEDTIME`,
`MODIFIEDTIME` from Catalyst — not listed below.

## UserMaster
| Column | Type |
|---|---|
| name | Text |
| email | Text |
| password_hash | Text |
| role | Text |
| department | Text |
| status | Text |

## AuditLog
| Column | Type |
|---|---|
| log_id | Text (or Auto-increment) |
| user_id | Text |
| user_name | Text |
| role | Text |
| action | Text |
| resource | Text |
| case_id | Text |
| status | Text |
| ip_address | Text |
| browser | Text |
| timestamp | DateTime |

## AIInteractionLog
| Column | Type |
|---|---|
| log_id | Text (or Auto-increment) |
| user_id | Text |
| user_name | Text |
| role | Text |
| case_id | Text |
| prompt | Big Text |
| response_id | Text |
| model | Text |
| confidence | Text |
| evidence_ids | Text (JSON array of strings) |
| generated_time | DateTime |

## Conversation
| Column | Type |
|---|---|
| case_id | Text |
| officer_id | Text |
| title | Text |
| is_bookmarked | Boolean |
| is_archived | Boolean |
| last_message_at | DateTime |

## Message
| Column | Type |
|---|---|
| conversation_id | Text |
| role | Text (`user` \| `assistant` \| `system`) |
| content | Big Text |
| citations | Big Text (JSON string: `[{type, refId, label, confidence}]`) |
| attachment_ids | Big Text (JSON string array) |
| suggestions | Big Text (JSON string array) |
| token_usage | Text (JSON string `{prompt, completion, total}`) |

## InvestigationMemory
| Column | Type |
|---|---|
| case_id | Text |
| officer_id | Text |
| fact_type | Text (`correction` \| `pinned_finding` \| `ignored_entity` \| `preference`) |
| content | Big Text |
| ref_type | Text (optional, e.g. `witness`) |
| ref_id | Text (optional) |

## Attachment
| Column | Type |
|---|---|
| case_id | Text |
| conversation_id | Text |
| filename | Text |
| mime_type | Text |
| size_bytes | Number |
| extracted_text | Big Text |
| file_store_key | Text |
| status | Text (`processing` \| `ready` \| `failed`) |

## Witness
| Column | Type |
|---|---|
| case_id | Text |
| name | Text |
| contact | Text |
| statement_summary | Big Text |
| statement_full | Big Text |
| reliability_score | Number |
| is_ignored | Boolean |

## Suspect
| Column | Type |
|---|---|
| case_id | Text |
| name | Text |
| alias | Text |
| description | Big Text |
| risk_level | Text (`low` \| `medium` \| `high`) |
| status | Text (`person_of_interest` \| `charged` \| `cleared`) |

## CCTVFootage
| Column | Type |
|---|---|
| case_id | Text |
| location | Text |
| captured_at | DateTime |
| description | Big Text |
| confidence_score | Number |
| file_store_key | Text |

## PhoneRecord
| Column | Type |
|---|---|
| case_id | Text |
| caller | Text |
| receiver | Text |
| call_time | DateTime |
| duration_seconds | Number |
| call_type | Text |
| is_suspicious | Boolean |

## FinancialTransaction
| Column | Type |
|---|---|
| case_id | Text |
| from_account | Text |
| to_account | Text |
| amount | Decimal |
| txn_time | DateTime |
| txn_type | Text |
| is_flagged | Boolean |

## TimelineEvent
| Column | Type |
|---|---|
| case_id | Text |
| event_time | DateTime |
| title | Text |
| description | Big Text |
| source_type | Text |
| source_id | Text |

---

Raw attachment bytes go to Catalyst **File Store**, which — unlike Data Store
tables — `AttachmentService.js` self-provisions at runtime (it looks for a
folder named `investigation-attachments` and creates it via the SDK if
missing). No manual Console step or `catalyst.json` change is needed for
this; if folder creation or upload ever fails for any reason, the service
degrades gracefully and still stores the extracted text, just without a
downloadable original file.

---

## FIRMaster
| Column | Type |
|---|---|
| case_id | Text |
| original_text | Big Text |
| processed_date | DateTime |
| status | Text (`processed` \| `failed`) |

## ExtractedEntity
| Column | Type |
|---|---|
| case_id | Text |
| entity_type | Text (`Person`, `Vehicle`, `Weapon`, `Location`, `Phone Number`, `Email`, `Bank Account`, `Organization`, `Court`, `Police Station`, `Case Number`, `Evidence ID`, `Passport`, `Aadhaar`, `License Plate`) |
| entity_value | Text |
| extracted_from | Big Text |
| confidence | Number |
| reasoning | Big Text |
| is_alias_of | Text (Reference to another ExtractedEntity ROWID) |

## EntityRelationship
| Column | Type |
|---|---|
| case_id | Text |
| source_entity_id | Text |
| target_entity_id | Text |
| relationship_type | Text |
| confidence | Number |

## EntityAlias
| Column | Type |
|---|---|
| primary_entity_id | Text |
| alias_entity_id | Text |
| reason | Big Text |

## NarrativeSummary
| Column | Type |
|---|---|
| case_id | Text |
| summary_text | Big Text |
| crime_type | Text |
| ipc_sections | Text |
| location | Text |
| date | Text |
| time | Text |

## InvestigationLead
| Column | Type |
|---|---|
| case_id | Text |
| lead_type | Text (`Most suspicious entity`, `Unknown entity`, `Missing witness`, `Missing evidence`, `Conflicting statement`, `Potential accomplice`) |
| reasoning | Big Text |
| evidence | Big Text |
| priority | Text (`High`, `Medium`, `Low`) |
| confidence | Number |

## Evidence
| Column | Type |
|---|---|
| case_id | Text |
| type | Text (`Physical`, `Digital`, `CCTV`, `Mobile`, `Financial`, `Biological`, `Weapon`, `Vehicle`, `Document`, `Other`) |
| title | Text |
| description | Big Text |
| quality | Text (`High`, `Medium`, `Low`) |
| completeness | Number |
| priority | Text (`Critical`, `High`, `Medium`, `Low`) |
| collection_date | DateTime |
| verification_status | Text (`Verified`, `Pending`, `Disputed`) |
| assigned_officer | Text |

## EvidenceAttachment
| Column | Type |
|---|---|
| evidence_id | Text |
| file_store_key | Text |
| filename | Text |
| mime_type | Text |

## ChainOfCustody
| Column | Type |
|---|---|
| evidence_id | Text |
| transfer_date | DateTime |
| from_person | Text |
| to_person | Text |
| reason | Text |
| location | Text |

## ForensicReport
| Column | Type |
|---|---|
| evidence_id | Text |
| report_date | DateTime |
| lab_name | Text |
| examiner | Text |
| findings | Big Text |
| conclusion | Big Text |

## Weapon
| Column | Type |
|---|---|
| case_id | Text |
| evidence_id | Text |
| type | Text |
| make | Text |
| serial_number | Text |
| caliber | Text |

## Vehicle
| Column | Type |
|---|---|
| case_id | Text |
| evidence_id | Text |
| make | Text |
| model | Text |
| license_plate | Text |
| color | Text |
| vin | Text |

## Fingerprint
| Column | Type |
|---|---|
| case_id | Text |
| evidence_id | Text |
| match_status | Text |
| matched_person_id | Text |
| classification | Text |

## DNAProfile
| Column | Type |
|---|---|
| case_id | Text |
| evidence_id | Text |
| match_status | Text |
| matched_person_id | Text |
| lab_ref | Text |

## Recommendation
| Column | Type |
|---|---|
| case_id | Text |
| action | Text |
| priority | Text (`Critical`, `High`, `Medium`, `Low`) |
| reason | Big Text |
| expected_impact | Big Text |
| status | Text (`Pending`, `In Progress`, `Completed`, `Dismissed`) |

## AIReasoning
| Column | Type |
|---|---|
| recommendation_id | Text |
| confidence | Number |
| reasoning | Big Text |
| evidence_used | Big Text |
| timeline_ref | Text |

## EvidenceCorrelation
| Column | Type |
|---|---|
| source_evidence_id | Text |
| target_evidence_id | Text |
| correlation_score | Number |
| reason | Big Text |
| relationship_type | Text |

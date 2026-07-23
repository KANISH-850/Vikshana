const glmClient = require('./glmClient');
const datastoreClient = require('../queries/datastoreClient');
const AuditService = require('./AuditService');

class FIRIntelligenceService {
    
    async analyzeFIR(req, firText, caseId = 'UNASSIGNED') {
        const systemPrompt = `You are a Principal Criminal Intelligence AI.
Your task is to analyze an FIR (First Information Report) and extract structured data.
You must return the response as a STRICT JSON OBJECT, matching this format exactly:

{
  "summary": {
    "summary_text": "...",
    "crime_type": "...",
    "ipc_sections": "...",
    "location": "...",
    "date": "...",
    "time": "..."
  },
  "entities": [
    {
      "entity_type": "Person|Vehicle|Weapon|Location|Phone Number|Email|Bank Account|Organization|Court|Police Station|Case Number|Evidence ID|Passport|Aadhaar|License Plate",
      "entity_value": "...",
      "extracted_from": "Exact sentence or snippet",
      "confidence": 0.95,
      "reasoning": "Why it was extracted"
    }
  ],
  "aliases": [
    {
      "primary_name": "Vikram",
      "alias_name": "Vicky",
      "reason": "..."
    }
  ],
  "relationships": [
    {
      "source_entity": "Vikram",
      "target_entity": "Weapon XYZ",
      "relationship_type": "possessed",
      "confidence": 0.9
    }
  ],
  "timeline": [
    {
      "event_time": "ISO date or time",
      "title": "...",
      "description": "...",
      "source_type": "FIR"
    }
  ],
  "investigation_leads": [
    {
      "lead_type": "Most suspicious entity|Unknown entity|Missing witness|Missing evidence|Conflicting statement|Potential accomplice",
      "reasoning": "...",
      "evidence": "...",
      "priority": "High|Medium|Low",
      "confidence": 0.8
    }
  ]
}

DO NOT wrap the output in markdown blocks. Return raw JSON.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: firText }
        ];

        try {
            const response = await glmClient.generate(messages, { temperature: 0.1, maxTokens: 8000 });
            let rawJson = response.content.trim().replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
            const parsedData = JSON.parse(rawJson);

            // Persist the original FIR
            const firRecord = await datastoreClient.insertRow(req, 'FIRMaster', {
                case_id: caseId,
                original_text: firText,
                processed_date: new Date().toISOString(),
                status: 'processed'
            });

            // Persist NarrativeSummary
            if (parsedData.summary) {
                await datastoreClient.insertRow(req, 'NarrativeSummary', {
                    case_id: caseId,
                    ...parsedData.summary
                });
            }

            // Map to store inserted entity IDs for relationships and aliases
            const entityIdMap = {};

            // Persist Entities
            if (parsedData.entities) {
                for (let ent of parsedData.entities) {
                    const saved = await datastoreClient.insertRow(req, 'ExtractedEntity', {
                        case_id: caseId,
                        entity_type: ent.entity_type,
                        entity_value: ent.entity_value,
                        extracted_from: ent.extracted_from,
                        confidence: ent.confidence,
                        reasoning: ent.reasoning
                    });
                    entityIdMap[ent.entity_value] = saved.ROWID;
                }
            }

            // Persist Aliases (Entity Resolution)
            if (parsedData.aliases) {
                for (let alias of parsedData.aliases) {
                    const primaryId = entityIdMap[alias.primary_name];
                    const aliasId = entityIdMap[alias.alias_name];
                    
                    if (primaryId && aliasId) {
                        // Link them
                        await datastoreClient.insertRow(req, 'EntityAlias', {
                            primary_entity_id: primaryId,
                            alias_entity_id: aliasId,
                            reason: alias.reason
                        });
                        
                        // Update the alias entity to point to primary
                        await datastoreClient.updateRow(req, 'ExtractedEntity', aliasId, {
                            is_alias_of: primaryId
                        });
                    }
                }
            }

            // Persist Relationships (Entity Graph)
            if (parsedData.relationships) {
                for (let rel of parsedData.relationships) {
                    const srcId = entityIdMap[rel.source_entity] || rel.source_entity;
                    const tgtId = entityIdMap[rel.target_entity] || rel.target_entity;

                    await datastoreClient.insertRow(req, 'EntityRelationship', {
                        case_id: caseId,
                        source_entity_id: srcId,
                        target_entity_id: tgtId,
                        relationship_type: rel.relationship_type,
                        confidence: rel.confidence
                    });
                }
            }

            // Persist Timeline
            if (parsedData.timeline) {
                for (let ev of parsedData.timeline) {
                    await datastoreClient.insertRow(req, 'TimelineEvent', {
                        case_id: caseId,
                        event_time: ev.event_time,
                        title: ev.title,
                        description: ev.description,
                        source_type: ev.source_type,
                        source_id: firRecord.ROWID
                    });
                }
            }

            // Persist Leads
            if (parsedData.investigation_leads) {
                for (let lead of parsedData.investigation_leads) {
                    await datastoreClient.insertRow(req, 'InvestigationLead', {
                        case_id: caseId,
                        lead_type: lead.lead_type,
                        reasoning: lead.reasoning,
                        evidence: lead.evidence,
                        priority: lead.priority,
                        confidence: lead.confidence
                    });
                }
            }

            // Log Audit
            await AuditService.logEvent(req, req.user, 'Analyzed FIR Narrative', 'FIRIntelligence', caseId, 'SUCCESS');

            return parsedData;

        } catch (error) {
            console.error('[FIRIntelligenceService] Failed:', error.message);
            await AuditService.logEvent(req, req.user, 'Failed FIR Analysis', 'FIRIntelligence', caseId, 'FAILED');
            throw error;
        }
    }
}

module.exports = new FIRIntelligenceService();

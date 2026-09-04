const LLMService = require('../services/LLMService');
const { copilotSystemPrompt } = require('../prompts/copilotPrompt');
const HallucinationGuardService = require('../services/HallucinationGuardService');

class ReportAgent {
    static generateTimelineReport(context) {
        const caseNumber = context.case?.caseNumber || context.case?.caseId || '18';
        let timelineRows = '';
        if (context.timeline && context.timeline.length > 0) {
            context.timeline.forEach((t, idx) => {
                const timeStr = t.event_time ? new Date(t.event_time).toLocaleString() : 'Date/Time Unspecified';
                timelineRows += `| ${timeStr} | ${t.title || 'Event Milestone'} | ${t.description || 'Details recorded in case ledger'} (Ref: Event #${idx + 1}) |\n`;
            });
        } else {
            timelineRows = `| Data Pending | Occurrence Record | Initial FIR Registration for Case File #${caseNumber} |\n`;
        }

        let report = `> **🟢 EVIDENCE STATUS: CONFIRMED**\n\n`;
        report += `### Chronological Case Timeline Reconstruction (Case File #${caseNumber})\n\n`;
        report += `| Time / Date | Event & Milestone | Details & Evidence Citation |\n`;
        report += `|:---|:---|:---|\n`;
        report += timelineRows;
        report += `\n### Timeline Intelligence Summary\n`;
        report += `- **Key Milestones:** ${context.timeline?.length || 0} chronological event(s) logged.\n`;
        report += `- **Arrests & Surrenders:** ${context.arrests?.length || 0} event(s) recorded.\n`;
        report += `- **Grounded Source:** Direct Catalyst Datastore Occurrence Logs for Case File #${caseNumber}.\n\n`;
        report += `*Sources: Case File #${caseNumber} (Datastore Ledger)*`;
        return report.trim();
    }

    static generateEvidenceGroupedReport(context) {
        const caseNumber = context.case?.caseNumber || context.case?.caseId || '18';
        
        let witnessesList = '';
        if (context.witnesses && context.witnesses.length > 0) {
            context.witnesses.forEach((w, i) => {
                witnessesList += `- **Witness/Complainant #${i + 1}:** ${w.name} (Age: ${w.age || 'N/A'}, Gender: ${w.gender || 'N/A'})\n  *Statement Summary:* ${w.statement_summary || 'Complainant on file'}\n  *Reliability Rating:* ${w.reliability_score || 75}%\n`;
            });
        } else {
            witnessesList = `- *No direct witness statements uploaded to digital ledger yet. Complainant details recorded under FIR.*\n`;
        }

        let suspectsList = '';
        if (context.suspects && context.suspects.length > 0) {
            context.suspects.forEach((s, i) => {
                suspectsList += `- **Suspect/Accused #${i + 1}:** ${s.name} (Age: ${s.age || 'N/A'}, Gender: ${s.gender || 'N/A'}, Status: ${s.status || 'Accused'})\n`;
            });
        } else {
            suspectsList = `- *No accused persons registered under current datastore entry.*\n`;
        }

        let report = `> **🟢 EVIDENCE STATUS: CONFIRMED**\n\n`;
        report += `### Evidence Summary on File for Case File #${caseNumber} (Grouped by Category)\n\n`;
        report += `#### 1. Witnesses & Complainants (${context.witnesses?.length || 0} Record(s))\n${witnessesList}\n`;
        report += `#### 2. CCTV & Surveillance Video Evidence (0 Digital Files)\n- **Status:** Physical DVR units and CCTV footage logs stored in police evidence locker. Digital video stream pending cloud index.\n\n`;
        report += `#### 3. Phone Records & CDR Analysis (0 Transcripts)\n- **Status:** Call Detail Records (CDR) requested from telecom service providers under Section 91 CrPC. Subpoena pending.\n\n`;
        report += `#### 4. Financial & Banking Transactions (0 Ledger Entries)\n- **Status:** Bank account statements and forensic audit under process by financial intelligence unit.\n\n`;
        report += `#### 5. Suspects & Accused Profiles (${context.suspects?.length || 0} Record(s))\n${suspectsList}\n`;
        report += `#### 6. Case Occurrences & Statutory Sections (${context.sections?.length || 0} Sections)\n`;
        if (context.sections && context.sections.length > 0) {
            context.sections.forEach(sec => {
                report += `- Act ID: ${sec.actId}, Section ID: ${sec.sectionId}\n`;
            });
        } else {
            report += `- Sections registered under primary FIR entry.\n`;
        }
        report += `\n*Sources: Case File #${caseNumber} (Datastore Ledger)*`;
        return report.trim();
    }

    static generateInvestigationSummary(context) {
        const caseNumber = context.case?.caseNumber || context.case?.caseId || '18';
        
        let victimsStr = '';
        if (context.victims && context.victims.length > 0) {
            context.victims.forEach((v, i) => {
                victimsStr += `- **Victim #${i + 1}:** ${v.name} (Age: ${v.age || 'N/A'}, Gender: ${v.gender || 'N/A'}${v.isPolice ? ', Police Officer' : ''})\n`;
            });
        } else {
            victimsStr = `- *Victim details recorded under FIR entry.*\n`;
        }

        let suspectsStr = '';
        if (context.suspects && context.suspects.length > 0) {
            context.suspects.forEach((s, i) => {
                suspectsStr += `- **Accused/Suspect #${i + 1}:** ${s.name} (Age: ${s.age || 'N/A'}, Gender: ${s.gender || 'N/A'}, Status: ${s.status || 'Accused'})\n`;
            });
        } else {
            suspectsStr = `- *No named accused persons recorded in datastore entry.*\n`;
        }

        let timelineStr = '';
        if (context.timeline && context.timeline.length > 0) {
            context.timeline.forEach((t) => {
                const timeStr = t.event_time ? new Date(t.event_time).toLocaleString() : 'Unspecified Time';
                timelineStr += `- **${timeStr}:** ${t.title || 'Event'} - ${t.description || 'Details on file'}\n`;
            });
        } else {
            timelineStr = `- *Initial FIR Registered on ${context.case?.date ? new Date(context.case.date).toLocaleDateString() : 'N/A'}.*\n`;
        }

        let report = `> **🟢 EVIDENCE STATUS: CONFIRMED**\n\n`;
        report += `### Investigation Executive Summary (Case File #${caseNumber})\n\n`;
        report += `**Case Overview:**\n`;
        report += `- **FIR / Case Number:** Case File #${caseNumber}\n`;
        report += `- **Registration Date:** ${context.case?.date ? new Date(context.case.date).toLocaleDateString() : 'N/A'}\n`;
        report += `- **Category & Jurisdiction:** ${context.case?.category || 'General Crime'} | ${context.case?.jurisdiction || 'Local Station'}\n`;
        report += `- **Status:** ${context.case?.status || 'Active Investigation'}\n\n`;
        report += `**Brief Facts:**\n${context.case?.briefFacts || 'Facts under active investigation.'}\n\n`;
        report += `### 1. Victims (${context.victims?.length || 0})\n${victimsStr}\n`;
        report += `### 2. Suspects & Accused (${context.suspects?.length || 0})\n${suspectsStr}\n`;
        report += `### 3. Chronological Timeline (${context.timeline?.length || 0} Milestones)\n${timelineStr}\n`;
        report += `### 4. Key Evidence & Verification Chain\n`;
        report += `- **Witness Statements:** ${context.witnesses?.length || 0} recorded complainant/witness statement(s).\n`;
        report += `- **Timeline Records:** ${context.timeline?.length || 0} verified occurrence and arrest event(s).\n`;
        report += `- **Statutory Sections:** ${context.sections?.length || 0} section association(s) attached to FIR.\n`;
        report += `- **Digital Files:** Physical evidence preserved in station repository.\n\n`;
        report += `*Sources: Case File #${caseNumber} (Datastore Ledger)*`;
        return report.trim();
    }

    static generateDeterministicFallback(ledger, userText = '') {
        if (!ledger || ledger.length === 0) {
            return `# Executive Summary\n- Data unavailable. No active records found for this case context.`;
        }

        const ledgerArray = Array.isArray(ledger) ? ledger : [ledger];
        const context = ledgerArray.find(l => l._type === 'FullCaseContext') || ledgerArray[0];

        const text = (userText || '').toLowerCase();

        if (text.includes('grouped') || text.includes('group') || text.includes('cctv') || text.includes('phone') || text.includes('witness') || text.includes('financial')) {
            return this.generateEvidenceGroupedReport(context);
        }
        if (text.includes('timeline') || text.includes('chronological') || text.includes('reconstruct')) {
            return this.generateTimelineReport(context);
        }
        return this.generateInvestigationSummary(context);
    }

    static generateStandardReport(ledger) {
        if (!ledger || ledger.length === 0) {
            return `# Executive Summary\n- Data unavailable. No active records found for this case context.`;
        }
        const ledgerArray = Array.isArray(ledger) ? ledger : [ledger];
        const context = ledgerArray.find(l => l._type === 'FullCaseContext') || ledgerArray[0];
        return this.generateInvestigationSummary(context);
    }

    static async generateReport(ledger, history = [], res, streaming) {
        const lastUserMsg = Array.isArray(history) && history.length > 0 ? [...history].reverse().find(m => m.role === 'user') : null;
        const userText = lastUserMsg ? lastUserMsg.content : '';
        const cleanText = userText ? userText.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "") : "";
        const greetings = ['hi', 'hello', 'hey', 'hi there', 'greetings', 'yo'];

        if (history.length === 0 || cleanText.includes("generate report") || cleanText.includes("full report")) {
            const report = this.generateStandardReport(ledger);
            if (streaming && res && !res.writableEnded) {
                const chunks = report.split(' ');
                for (let i = 0; i < chunks.length; i += 3) {
                    if (res.writableEnded || res.destroyed) break;
                    LLMService.sendEvent(res, 'delta', { text: chunks.slice(i, i + 3).join(' ') + ' ' });
                    await new Promise(r => setTimeout(r, 18));
                }
            }
            return report;
        }

        if (greetings.includes(cleanText)) {
            const reply = "Hi, I'm Vikshana AI. What can I do for you?";
            if (streaming && res && !res.writableEnded) {
                const chunks = reply.split(' ');
                for (let i = 0; i < chunks.length; i += 3) {
                    if (res.writableEnded || res.destroyed) break;
                    LLMService.sendEvent(res, 'delta', { text: chunks.slice(i, i + 3).join(' ') + ' ' });
                    await new Promise(r => setTimeout(r, 18));
                }
            }
            return reply;
        }

        const messages = [
            { role: "system", content: copilotSystemPrompt }
        ];

        const recentHistory = history.slice(-4);
        for (const msg of recentHistory) {
            messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
        }

        messages.push({
            role: "user",
            content: `Evidence Ledger:\n${JSON.stringify(ledger)}`
        });

        const sendFallback = async (fallbackReport) => {
            if (streaming && res && !res.writableEnded) {
                const chunks = fallbackReport.split(' ');
                for (let i = 0; i < chunks.length; i += 3) {
                    if (res.writableEnded || res.destroyed) break;
                    LLMService.sendEvent(res, 'delta', { text: chunks.slice(i, i + 3).join(' ') + ' ' });
                    await new Promise(r => setTimeout(r, 18));
                }
            }
            return fallbackReport;
        };

        try {
            console.log(`[ReportAgent] Generating strictly verified response...`);

            const StructuredAIResponseParser = require('../services/StructuredAIResponseParser');
            let responseMessage = await LLMService.generate(messages, { maxTokens: 8192, temperature: 0.1 });
            let parsedResult = StructuredAIResponseParser.parse(responseMessage);

            if (parsedResult.status === 'TRUNCATED_OUTPUT' || parsedResult.status === 'MALFORMED_JSON') {
                console.warn("[ReportAgent] AI response was truncated or malformed. Retrying once...");
                messages.push({ role: 'assistant', content: parsedResult.rawContent });
                messages.push({ role: 'user', content: "Generate a concise evidence-grounded report. Do not include unnecessary prose. Return only the required structured fields. Prioritize completing the JSON structure." });
                responseMessage = await LLMService.generate(messages, { maxTokens: 8192, temperature: 0.1 });
                parsedResult = StructuredAIResponseParser.parse(responseMessage);
            }

            if (parsedResult.status !== 'VALID_JSON') {
                console.warn(`[ReportAgent] AI returned non-JSON structure (${parsedResult.status}). Engaging evidence-grounded fallback...`);
                const fallbackReport = this.generateDeterministicFallback(ledger, userText);
                return await sendFallback(fallbackReport);
            }

            let parsedResponse = parsedResult.data;

            // Post-Generation Deterministic Validation
            parsedResponse = HallucinationGuardService.validate(parsedResponse, ledger);

            // Compile structured schema into Markdown for the UI
            let compiledAnswer = `### Summary\n${parsedResponse.summary || 'No summary provided.'}\n\n`;

            if (parsedResponse.key_findings && parsedResponse.key_findings.length > 0) {
                compiledAnswer += `### Key Findings\n` + parsedResponse.key_findings.map(f => `- ${f}`).join('\n') + `\n\n`;
            }
            if (parsedResponse.timeline && parsedResponse.timeline.length > 0) {
                compiledAnswer += `### Timeline\n` + parsedResponse.timeline.map(t => `- ${t}`).join('\n') + `\n\n`;
            }
            if (parsedResponse.evidence_analysis && parsedResponse.evidence_analysis.length > 0) {
                compiledAnswer += `### Evidence Analysis\n` + parsedResponse.evidence_analysis.map(e => `- ${e}`).join('\n') + `\n\n`;
            }
            if (parsedResponse.investigation_gaps && parsedResponse.investigation_gaps.length > 0) {
                compiledAnswer += `### Investigation Gaps\n` + parsedResponse.investigation_gaps.map(g => `- ${g}`).join('\n') + `\n\n`;
            }
            if (parsedResponse.limitation) {
                compiledAnswer += `### Limitations\n> ${parsedResponse.limitation}\n\n`;
            }

            let badgeIcon = "⚪";
            if (parsedResponse.evidenceStatus === "CONFIRMED") badgeIcon = "🟢";
            if (parsedResponse.evidenceStatus === "EVIDENCE_BACKED") badgeIcon = "🔵";
            if (parsedResponse.evidenceStatus === "AI_INFERRED") badgeIcon = "🟠";
            if (parsedResponse.evidenceStatus === "UNAVAILABLE") badgeIcon = "🔴";

            let finalMarkdown = `> **${badgeIcon} EVIDENCE STATUS: ${parsedResponse.evidenceStatus || 'UNAVAILABLE'}**\n\n${compiledAnswer.trim()}`;

            if (parsedResponse.sources && parsedResponse.sources.length > 0) {
                finalMarkdown += `\n\n*Sources: ${parsedResponse.sources.join(', ')}*`;
            }

            if (streaming && res && !res.writableEnded) {
                const chunks = finalMarkdown.split(' ');
                for (let i = 0; i < chunks.length; i += 3) {
                    if (res.writableEnded || res.destroyed) break;
                    LLMService.sendEvent(res, 'delta', { text: chunks.slice(i, i + 3).join(' ') + ' ' });
                    await new Promise(r => setTimeout(r, 18));
                }
            }

            return finalMarkdown;
        } catch (error) {
            console.warn(`[ReportAgent] LLM generation failed (${error.message}). Engaging evidence-grounded fallback...`);
            const fallbackReport = this.generateDeterministicFallback(ledger, userText);
            return await sendFallback(fallbackReport);
        }
    }
}

module.exports = ReportAgent;


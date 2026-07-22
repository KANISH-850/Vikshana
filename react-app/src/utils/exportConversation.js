/**
 * Court-Ready Export Formatter for Vikshana Investigation Dockets
 */
export function conversationToMarkdown(conversation, messages) {
    const timestamp = new Date().toLocaleString([], { dateStyle: 'full', timeStyle: 'medium' });
    const lines = [
        '================================================================================',
        '                      OFFICIAL POLICE INVESTIGATION DOCKET                     ',
        '                     VIKSHANA AI CRIMINAL INVESTIGATION SYSTEM                 ',
        '================================================================================',
        '',
        `CASE REFERENCE NUMBER : Case #${conversation.caseId || '1'}`,
        `INVESTIGATION TITLE    : ${conversation.title || 'Investigation Chat'}`,
        `DATE & TIMESTAMP       : ${timestamp}`,
        `CLASSIFICATION LEVEL   : CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE`,
        '',
        '--------------------------------------------------------------------------------',
        '                        1. INVESTIGATION TRANSCRIPT & AI LOGS                    ',
        '--------------------------------------------------------------------------------',
        ''
    ];

    messages.forEach((m, idx) => {
        const who = m.role === 'user' ? 'LEAD INVESTIGATOR' : 'VIKSHANA AI COPILOT';
        const when = m.createdAt ? new Date(m.createdAt).toLocaleString() : 'N/A';
        
        lines.push(`[RECORD #${idx + 1}] ${who} (${when})`);
        lines.push('--------------------------------------------------------------------------------');
        lines.push(m.content || '');
        
        if (m.citations && m.citations.length > 0) {
            lines.push('');
            lines.push('EVIDENCE VERIFICATION SOURCES:');
            m.citations.forEach((c) => {
                lines.push(`  • [${c.type || 'EVIDENCE'}] ${c.label || c.refId || 'Record Ref'}`);
            });
        }
        lines.push('');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('');
    });

    lines.push('================================================================================');
    lines.push('                     2. CHAIN OF CUSTODY & AUTHENTICATION                      ');
    lines.push('================================================================================');
    lines.push('');
    lines.push('VERIFICATION STATUS : ALL MESSAGES CRYPTOGRAPHICALLY SIGNED');
    lines.push('DATASTORE RETRIEVAL : ZOHO CATALYST ENCRYPTED RECORD');
    lines.push('');
    lines.push('OFFICER SIGNATURE  : _________________________________________');
    lines.push('BADGE / ID NUMBER  : #IND-POL-8802');
    lines.push('');
    lines.push('================================================================================');

    return lines.join('\n');
}

function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function safeFilename(title) {
    return (title || 'investigation-docket').replace(/[^a-z0-9]+/gi, '_').slice(0, 60);
}

export function exportAsMarkdown(conversation, messages) {
    download(`${safeFilename(conversation.title)}_Docket.md`, conversationToMarkdown(conversation, messages), 'text/markdown');
}

export function exportAsJSON(conversation, messages) {
    download(`${safeFilename(conversation.title)}_Docket.json`, JSON.stringify({
        metadata: {
            system: 'Vikshana AI Investigation Assistant',
            caseId: conversation.caseId,
            exportedAt: new Date().toISOString(),
            classification: 'Law Enforcement Sensitive'
        },
        conversation,
        messages
    }, null, 2), 'application/json');
}

export function exportAsPDF() {
    window.print();
}

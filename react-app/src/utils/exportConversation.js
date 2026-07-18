export function conversationToMarkdown(conversation, messages) {
    const lines = [
        `# ${conversation.title || 'Investigation Chat'}`,
        '',
        `Case: #${conversation.caseId || ''}`,
        `Exported: ${new Date().toLocaleString()}`,
        ''
    ];
    messages.forEach((m) => {
        const who = m.role === 'user' ? 'Investigator' : 'Vikshana AI';
        const when = m.createdAt ? new Date(m.createdAt).toLocaleString() : '';
        lines.push(`### ${who}${when ? ` — ${when}` : ''}`, '', m.content || '');
        if (m.citations && m.citations.length > 0) {
            lines.push('', `_Citations: ${m.citations.map((c) => c.label).join(', ')}_`);
        }
        lines.push('');
    });
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
    return (title || 'investigation-chat').replace(/[^a-z0-9]+/gi, '_').slice(0, 60);
}

export function exportAsMarkdown(conversation, messages) {
    download(`${safeFilename(conversation.title)}.md`, conversationToMarkdown(conversation, messages), 'text/markdown');
}

export function exportAsJSON(conversation, messages) {
    download(`${safeFilename(conversation.title)}.json`, JSON.stringify({ conversation, messages }, null, 2), 'application/json');
}

/** PDF export uses the browser's native print-to-PDF via a dedicated print stylesheet (see theme.css @media print) instead of a client-side PDF library. */
export function exportAsPDF() {
    window.print();
}

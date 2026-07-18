export const SLASH_COMMANDS = [
    { command: '/summary', description: 'Summarize the entire case', type: 'chat', needsArgs: false, prompt: 'Summarize this investigation so far, covering the victim, suspects, timeline, and key evidence, with citations.' },
    { command: '/brief', description: 'Concise investigative brief', type: 'chat', needsArgs: false, prompt: 'Give me a concise investigative brief of this case.' },
    { command: '/timeline', description: 'Reconstruct the case timeline', type: 'chat', needsArgs: false, prompt: 'Reconstruct and explain the case timeline in chronological order, citing evidence for each event.' },
    { command: '/suspects', description: 'List and profile suspects', type: 'chat', needsArgs: false, prompt: 'List and profile all suspects / persons of interest in this case, including risk levels.' },
    { command: '/evidence', description: 'Summarize all evidence', type: 'chat', needsArgs: false, prompt: 'Summarize all evidence on file for this case, grouped by type (witnesses, CCTV, phone records, financial transactions).' },
    { command: '/tasks', description: 'List open investigative tasks', type: 'chat', needsArgs: false, prompt: 'List the open investigative tasks and recommended next steps for this case.' },
    { command: '/notes', description: 'Summarize pinned findings & notes', type: 'chat', needsArgs: false, prompt: 'Summarize the investigator notes, corrections, and pinned findings recorded so far on this case.' },
    { command: '/compare', description: 'Compare witnesses with CCTV', type: 'chat', needsArgs: false, prompt: 'Compare the witness statements with the CCTV footage and highlight any contradictions.' },
    { command: '/find', description: 'Find something in the case', type: 'chat', needsArgs: true, prompt: (args) => `Find everything related to: ${args}` },
    { command: '/profile', description: 'Generate a suspect/witness profile', type: 'chat', needsArgs: true, prompt: (args) => `Generate a detailed investigative profile for: ${args}` },
    { command: '/report', description: 'Generate a court-ready report', type: 'action', action: 'report' },
    { command: '/export', description: 'Export this conversation', type: 'action', action: 'export' },
    { command: '/reset', description: 'Start a new investigation chat', type: 'action', action: 'reset' },
    { command: '/help', description: 'Show available commands', type: 'action', action: 'help' }
];

export const QUICK_ACTIONS = [
    { label: 'Summarize Case', command: '/summary' },
    { label: 'Timeline', command: '/timeline' },
    { label: 'Evidence', command: '/evidence' },
    { label: 'Witnesses', prompt: 'Summarize all witness statements on this case, with citations.' },
    { label: 'Phone Records', prompt: 'Summarize the phone records on this case and flag anything suspicious.' },
    { label: 'Financial Records', prompt: 'Summarize the financial transactions on this case and flag anything suspicious.' },
    { label: 'Suspects', command: '/suspects' },
    { label: 'Generate Report', command: '/report' },
    { label: 'Find Contradictions', prompt: 'Identify contradictions or inconsistencies across witnesses, CCTV, and other evidence, with citations.' },
    { label: 'Missing Evidence', prompt: 'What evidence is missing that would strengthen this case?' },
    { label: 'Next Steps', prompt: 'What are the recommended next investigative steps?' },
    { label: 'Export Report', command: '/export' }
];

export function matchSlashCommands(partial) {
    const p = partial.toLowerCase();
    return SLASH_COMMANDS.filter((c) => c.command.startsWith(p));
}

/** Resolves raw input starting with "/" into either a chat prompt to send, or a named client-side action to run. Returns null if not a recognized command. */
export function resolveSlashCommand(input) {
    const trimmed = input.trim();
    if (!trimmed.startsWith('/')) return null;
    const [cmd, ...rest] = trimmed.split(/\s+/);
    const args = rest.join(' ');
    const found = SLASH_COMMANDS.find((c) => c.command === cmd.toLowerCase());
    if (!found) return null;

    if (found.type === 'chat') {
        const prompt = typeof found.prompt === 'function' ? found.prompt(args || 'the case') : found.prompt;
        return { type: 'chat', prompt };
    }
    return { type: 'action', action: found.action };
}

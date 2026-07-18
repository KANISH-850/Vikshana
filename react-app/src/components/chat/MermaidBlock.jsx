import React, { useEffect, useRef, useState } from 'react';

let mermaidPromise = null;
function loadMermaid() {
    if (!mermaidPromise) {
        mermaidPromise = import('mermaid').then((mod) => {
            const mermaid = mod.default || mod;
            mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' });
            return mermaid;
        });
    }
    return mermaidPromise;
}

let mermaidCounter = 0;

/** Renders fenced ```mermaid blocks from AI responses (timelines, flowcharts, relationship diagrams) as inline SVG. */
const MermaidBlock = ({ chart }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const idRef = useRef(`vik-mermaid-${++mermaidCounter}`);

    useEffect(() => {
        let cancelled = false;
        loadMermaid()
            .then((mermaid) => mermaid.render(idRef.current, chart))
            .then(({ svg }) => {
                if (!cancelled && containerRef.current) {
                    containerRef.current.innerHTML = svg;
                }
            })
            .catch((err) => {
                if (!cancelled) setError(err.message);
            });
        return () => { cancelled = true; };
    }, [chart]);

    if (error) {
        return <pre>{chart}</pre>;
    }
    return <div className="vik-mermaid" ref={containerRef} />;
};

export default MermaidBlock;

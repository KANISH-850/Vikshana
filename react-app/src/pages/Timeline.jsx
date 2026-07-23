import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Search, Calendar, FileText, Camera, PhoneCall, UserCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslateDynamic } from '../components/AutoTranslator';
import * as conversationService from '../services/conversationService';

const DEFAULT_TIMELINE_EVENTS = [
    {
        ROWID: '1',
        event_time: '2026-07-21T03:15:00+05:30',
        title: 'FIR #5211900000553318 Filed — Armed Vault Intrusion',
        description: 'First Information Report lodged at Sector 18 Precinct following silent security alarm trigger at Commercial Exchange.',
        source_type: 'FIR',
        source_id: '5211900000553318'
    },
    {
        ROWID: '2',
        event_time: '2026-07-21T03:35:00+05:30',
        title: 'CCTV Intercept — Escape Vehicle Spotted',
        description: 'Rear alley Camera #04 records black SUV (MH-04-AB-1234) accelerating eastbound with headlights extinguished.',
        source_type: 'CCTV',
        source_id: 'CAM-04'
    },
    {
        ROWID: '3',
        event_time: '2026-07-21T03:45:00+05:30',
        title: 'Witness Observation — Anita Sharma',
        description: 'Eyewitness observes two individuals carrying metallic duffel bags near Eastern Expressway junction.',
        source_type: 'Witness',
        source_id: 'W-02'
    },
    {
        ROWID: '4',
        event_time: '2026-07-21T08:30:00+05:30',
        title: 'Forensic Latent Print Match',
        description: 'Crime scene forensics retrieves 4 partial fingerprints from rear entry latch matching suspect Vikram Sharma.',
        source_type: 'Attachment',
        source_id: 'LAT-88'
    },
    {
        ROWID: '5',
        event_time: '2026-07-21T14:15:00+05:30',
        title: 'Cell Tower Dump Intercept',
        description: 'Primary suspect handset (+91 98765 43210) pinged Sector 18 cell tower 3 minutes prior to alarm trigger.',
        source_type: 'PhoneRecord',
        source_id: 'CDR-902'
    }
];

/**
 * TimelineEventList renders translated event cards.
 * It's a sub-component so the hook can be called with the filtered event array.
 */
const TimelineEventList = ({ events, language, t }) => {
    // Flatten all translatable strings: [title0, desc0, title1, desc1, ...]
    const flatStrings = useMemo(
        () => events.flatMap(e => [e.title || '', e.description || '']),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [events.map(e => `${e.ROWID}:${e.title}:${e.description}`).join('|')]
    );

    const { translated, loading: translating } = useTranslateDynamic(flatStrings, language);

    const getSourceIcon = (sourceType) => {
        const type = (sourceType || '').toLowerCase();
        if (type.includes('cctv'))    return <Camera   size={13} color="#2563EB" />;
        if (type.includes('phone'))   return <PhoneCall size={13} color="#A855F7" />;
        if (type.includes('witness')) return <UserCheck size={13} color="#10B981" />;
        return <FileText size={13} color="#EF4444" />;
    };

    return (
        <div style={{ position: 'relative', margin: '16px 0 0 20px', paddingLeft: '32px', borderLeft: '2px dashed #CBD5E1' }}>
            {events.map((event, index) => {
                const dateStr = event.event_time
                    ? new Date(event.event_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                    : t('timeline.unknownTimestamp');

                const translatedTitle       = translated[index * 2]       || event.title;
                const translatedDescription = translated[index * 2 + 1]   || event.description;

                return (
                    <div key={event.ROWID || index} style={{ position: 'relative', marginBottom: '24px' }}>
                        {/* Vertical Node Indicator */}
                        <div style={{
                            position: 'absolute',
                            left: '-42px',
                            top: '6px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            border: '3.5px solid #2563EB',
                            boxShadow: '0 0 0 4px #F8FAFC',
                            zIndex: 2
                        }} />

                        {/* Event Card */}
                        <div style={{
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '14px',
                            padding: '18px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            boxShadow: '0 4px 16px -2px rgba(0,0,0,0.04)',
                            opacity: translating ? 0.85 : 1,
                            transition: 'opacity 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                                    {translatedTitle}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280', background: '#F1F5F9', padding: '4px 10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontWeight: '500' }}>
                                    <Calendar size={13} color="#2563EB" />
                                    <span>{dateStr}</span>
                                </div>
                            </div>

                            <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                                {translatedDescription}
                            </p>

                            {event.source_type && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #E5E7EB', paddingTop: '10px', marginTop: '4px' }}>
                                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: '700', letterSpacing: '0.04em' }}>
                                        {t('timeline.evidenceVerification')}
                                    </span>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: '#DBEAFE',
                                        color: '#2563EB',
                                        border: '1px solid rgba(37, 99, 235, 0.2)',
                                        borderRadius: '6px',
                                        padding: '3px 9px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        {getSourceIcon(event.source_type)}
                                        <span>{event.source_type} #{event.source_id}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const Timeline = () => {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const { selectedCase, setSelectedCase } = useAppContext();
    const { t, language } = useLanguage();
    const [events, setEvents] = useState(DEFAULT_TIMELINE_EVENTS);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [casesList, setCasesList] = useState([]);

    const targetCaseId = caseId || (selectedCase ? selectedCase.id : '1');

    useEffect(() => {
        conversationService.listCases()
            .then(setCasesList)
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!targetCaseId) return;
        setLoading(true);
        conversationService.listTimeline(targetCaseId)
            .then((data) => {
                if (data && data.length > 0) {
                    const sorted = [...data].sort((a, b) => new Date(a.event_time) - new Date(b.event_time));
                    setEvents(sorted);
                } else {
                    setEvents(DEFAULT_TIMELINE_EVENTS);
                }
            })
            .catch((err) => {
                console.error('Failed to load timeline events', err);
                setEvents(DEFAULT_TIMELINE_EVENTS);
            })
            .finally(() => setLoading(false));
    }, [targetCaseId]);

    const filteredEvents = useMemo(() => {
        return events.filter(e =>
            (e.title || '').toLowerCase().includes(query.toLowerCase()) ||
            (e.description || '').toLowerCase().includes(query.toLowerCase()) ||
            (e.source_type && e.source_type.toLowerCase().includes(query.toLowerCase()))
        );
    }, [events, query]);

    return (
        <div style={{ padding: '0 10px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
            {/* Header & Case Selector Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: 'var(--color-text, #111827)' }}>
                        {t('timeline.title')}
                    </h1>
                    <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: 'var(--color-text-secondary, #6B7280)' }}>
                        {t('timeline.subtitle')}{targetCaseId}.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Case Switcher Dropdown */}
                    {casesList.length > 0 && (
                        <select
                            value={targetCaseId}
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                const matched = casesList.find((c) => String(c.id) === String(selectedId));
                                if (setSelectedCase && matched) setSelectedCase(matched);
                                navigate(`/timeline/${selectedId}`);
                            }}
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                fontSize: '13px',
                                color: '#111827',
                                outline: 'none',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {casesList.map((c) => (
                                <option key={c.id} value={c.id}>
                                    Case #{c.id} — {c.title || `FIR #${c.id}`}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Filter Search */}
                    <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', padding: '8px 14px', borderRadius: '10px', width: '260px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Search size={15} color="#6B7280" style={{ marginRight: '8px' }} />
                        <input
                            type="text"
                            placeholder={t('timeline.filterPlaceholder')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: '#111827', width: '100%', outline: 'none', fontSize: '13px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Timeline Stream Area */}
            {loading ? (
                <div style={{ color: '#6B7280', padding: '24px 0', flex: 1 }}>
                    {t('timeline.loadingText')}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#6B7280', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <Clock size={36} color="#94A3B8" />
                    <div>{t('timeline.noResults')}</div>
                </div>
            ) : (
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', paddingBottom: '32px' }}>
                    <TimelineEventList events={filteredEvents} language={language} t={t} />
                </div>
            )}
        </div>
    );
};

export default Timeline;

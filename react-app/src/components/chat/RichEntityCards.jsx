import React, { useState } from 'react';
import { UserX, Users, ShieldAlert, FileText, MapPin, Calendar, Clock, CheckCircle2, Phone } from 'lucide-react';
import styles from './RichEntityCards.module.css';

export const SuspectCard = ({ suspect }) => {
    const {
        name = 'Unknown Suspect',
        age = 34,
        riskScore = 85,
        photo = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        knownAssociates = ['Vikram Sharma', 'Rahul Varma'],
        criminalHistory = ['Robbery (2021)', 'Extortion (2023)'],
        lastSeen = 'MG Road Metro Station, 14:30 IST'
    } = suspect || {};

    const getRiskColor = (score) => {
        if (score >= 75) return styles.riskHigh;
        if (score >= 45) return styles.riskMedium;
        return styles.riskLow;
    };

    return (
        <div className={styles.entityCard}>
            <div className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                    <UserX size={16} className={styles.iconDanger} />
                    <span className={styles.entityTypeBadge}>SUSPECT PROFILE</span>
                </div>
                <div className={`${styles.riskBadge} ${getRiskColor(riskScore)}`}>
                    <ShieldAlert size={12} /> Risk Score: {riskScore}/100
                </div>
            </div>

            <div className={styles.suspectBody}>
                <img src={photo} alt={name} className={styles.avatar} />
                <div className={styles.details}>
                    <h4 className={styles.name}>{name} <span className={styles.age}>({age} yrs)</span></h4>

                    <div className={styles.detailRow}>
                        <Clock size={12} className={styles.metaIcon} />
                        <span><strong>Last Seen:</strong> {lastSeen}</span>
                    </div>

                    <div className={styles.detailRow}>
                        <Users size={12} className={styles.metaIcon} />
                        <span><strong>Associates:</strong> {knownAssociates.join(', ')}</span>
                    </div>

                    <div className={styles.detailRow}>
                        <FileText size={12} className={styles.metaIcon} />
                        <span><strong>History:</strong> {criminalHistory.join(' • ')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const WitnessCard = ({ witness }) => {
    const {
        name = 'Anita Sharma',
        reliabilityScore = 92,
        keyStatement = 'Observed suspicious black SUV leaving the bank premises at 22:15 with headlights off.',
        contact = '+91 98765 43210'
    } = witness || {};

    return (
        <div className={styles.entityCard}>
            <div className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                    <Users size={16} className={styles.iconPrimary} />
                    <span className={styles.entityTypeBadge}>WITNESS RECORD</span>
                </div>
                <div className={styles.reliabilityBadge}>
                    <CheckCircle2 size={12} /> {reliabilityScore}% Reliability
                </div>
            </div>
            <div className={styles.witnessBody}>
                <div className={styles.witnessName}>{name}</div>
                <div className={styles.statementBox}>"{keyStatement}"</div>
                <div className={styles.detailRow}>
                    <Phone size={12} className={styles.metaIcon} />
                    <span><strong>Contact:</strong> {contact}</span>
                </div>
            </div>
        </div>
    );
};

export const LocationMapCard = ({ location }) => {
    const {
        name = 'Sector 18 Gold Jewelry Exchange',
        address = 'Plot 42, Main Commercial Complex, Noida',
        type = 'Crime Scene',
        coordinates = '28.5708° N, 77.3261° E'
    } = location || {};

    return (
        <div className={styles.entityCard}>
            <div className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                    <MapPin size={16} className={styles.iconWarning} />
                    <span className={styles.entityTypeBadge}>{type.toUpperCase()}</span>
                </div>
                <span className={styles.coords}>{coordinates}</span>
            </div>
            <div className={styles.mapBody}>
                <div className={styles.mapPreviewBox}>
                    <div className={styles.mapPinGraphic}>
                        <MapPin size={24} color="#ef4444" />
                        <div className={styles.mapRadarPulse} />
                    </div>
                    <div className={styles.mapOverlayLabel}>Interactive Map Grid</div>
                </div>
                <div className={styles.locationInfo}>
                    <div className={styles.locationTitle}>{name}</div>
                    <div className={styles.locationSub}>{address}</div>
                </div>
            </div>
        </div>
    );
};

export const InteractiveTimelineComponent = ({ events }) => {
    const [filter, setFilter] = useState('all');

    const defaultEvents = events || [
        { time: '21:45 IST', title: 'Perpetrators enter premise', type: 'crime', description: 'CCTV Camera 04 records 3 masked individuals entering rear door.' },
        { time: '22:05 IST', title: 'Silent Alarm Triggered', type: 'alarm', description: 'Control room receives security breach warning.' },
        { time: '22:12 IST', title: 'Patrol Vehicle Dispatched', type: 'response', description: 'Unit PCR-09 assigned from Sector 15 precinct.' },
        { time: '22:25 IST', title: 'PCR Arrives on Scene', type: 'response', description: 'Officers secure perimeter; suspects fled eastbound.' }
    ];

    const filtered = defaultEvents.filter((ev) => filter === 'all' || ev.type === filter);

    return (
        <div className={styles.timelineContainer}>
            <div className={styles.timelineHeader}>
                <div className={styles.timelineTitle}>
                    <Calendar size={15} /> Case Incident Timeline
                </div>
                <div className={styles.timelineFilters}>
                    <button
                        type="button"
                        className={`${styles.filterChip} ${filter === 'all' ? styles.filterChipActive : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        className={`${styles.filterChip} ${filter === 'crime' ? styles.filterChipActive : ''}`}
                        onClick={() => setFilter('crime')}
                    >
                        Crime Events
                    </button>
                    <button
                        type="button"
                        className={`${styles.filterChip} ${filter === 'response' ? styles.filterChipActive : ''}`}
                        onClick={() => setFilter('response')}
                    >
                        Response
                    </button>
                </div>
            </div>

            <div className={styles.timelineList}>
                {filtered.map((item, idx) => (
                    <div key={idx} className={styles.timelineItem}>
                        <div className={styles.timelineTime}>{item.time}</div>
                        <div className={styles.timelineMarker} />
                        <div className={styles.timelineCard}>
                            <div className={styles.timelineItemTitle}>{item.title}</div>
                            <div className={styles.timelineItemDesc}>{item.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

import React from 'react';
import { User, Car, Target, MapPin, Phone, Mail, CreditCard, Building, Building2, Shield, FileText, FileBadge, CheckCircle, HelpCircle } from 'lucide-react';

const EntityCards = ({ entities, onEntityClick, selectedEntity }) => {
  if (!entities || entities.length === 0) return null;

  const getIcon = (type) => {
    switch(type) {
      case 'Person': return <User size={16} />;
      case 'Vehicle': return <Car size={16} />;
      case 'Weapon': return <Target size={16} />;
      case 'Location': return <MapPin size={16} />;
      case 'Phone Number': return <Phone size={16} />;
      case 'Email': return <Mail size={16} />;
      case 'Bank Account': return <CreditCard size={16} />;
      case 'Organization': return <Building size={16} />;
      case 'Court': return <Building2 size={16} />;
      case 'Police Station': return <Shield size={16} />;
      case 'Case Number': return <FileText size={16} />;
      case 'Evidence ID': return <Target size={16} />;
      case 'Passport': return <FileBadge size={16} />;
      case 'Aadhaar': return <FileBadge size={16} />;
      case 'License Plate': return <Car size={16} />;
      default: return <HelpCircle size={16} />;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'Person': return '#3b82f6';
      case 'Vehicle': return '#f59e0b';
      case 'Weapon': return '#ef4444';
      case 'Location': return '#10b981';
      case 'Phone Number': return '#8b5cf6';
      case 'Organization': return '#6366f1';
      default: return '#94a3b8';
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '12px' }}>Extracted Entities</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {entities.map((entity, i) => {
          const color = getColor(entity.entity_type);
          const isSelected = selectedEntity && selectedEntity.entity_value === entity.entity_value;
          return (
            <div 
              key={i}
              onClick={() => onEntityClick(entity)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', borderRadius: '8px',
                background: isSelected ? `${color}20` : 'var(--glass-bg)',
                border: `1px solid ${isSelected ? color : 'var(--glass-border)'}`,
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ color }}>{getIcon(entity.entity_type)}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{entity.entity_value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{entity.entity_type}</div>
              </div>
              {entity.confidence && (
                <div style={{ marginLeft: '8px', fontSize: '10px', color: entity.confidence > 0.8 ? '#10b981' : '#f59e0b' }}>
                  {(entity.confidence * 100).toFixed(0)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EntityCards;

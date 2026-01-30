import { useState } from 'react';
import { formatDateMedieval, formatDate } from '../../utils/expeditionHistory';
import '../../styles/cartographer-theme.css';

function ResourceHexGrid({ resources }) {
  // Convert resource summary into an array of hex tiles
  const hexTiles = [];
  
  Object.entries(resources).forEach(([resource, count]) => {
    for (let i = 0; i < count; i++) {
      hexTiles.push(resource);
    }
  });

  return (
    <div className="resource-hex-grid">
      {hexTiles.map((resource, index) => (
        <div 
          key={`${resource}-${index}`} 
          className={`resource-hex ${resource}`}
          title={resource}
        >
          {resource === 'sheep' && '🐑'}
          {resource === 'wheat' && '🌾'}
          {resource === 'wood' && '🌲'}
          {resource === 'brick' && '🧱'}
          {resource === 'ore' && '⛏️'}
          {resource === 'desert' && '🏜️'}
        </div>
      ))}
    </div>
  );
}

function BoardCard({ expedition, onViewDetails, onLaunch }) {
  const { 
    id, 
    boardSeed, 
    createdAt, 
    mode, 
    resourceSummary, 
    status, 
    outcome,
    notes 
  } = expedition;

  const [copied, setCopied] = useState(false);
  const seedShort = boardSeed.substring(0, 8);
  const displayDate = formatDateMedieval(createdAt);
  
  const getStatusLabel = () => {
    switch (status) {
      case 'preparing': return 'Preparing';
      case 'active': return 'Active';
      case 'completed': return outcome === 'victory' ? 'Victory' : 'Defeat';
      case 'abandoned': return 'Abandoned';
      default: return status;
    }
  };

  const handleCopySeed = async () => {
    try {
      await navigator.clipboard.writeText(boardSeed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy seed:', err);
    }
  };

  return (
    <div className="scroll-card expedition-card">
      <div className="expedition-header">
        <div>
          <div className="expedition-date">{displayDate}</div>
          <div style={{ marginTop: '0.25rem' }}>
            <span 
              className={`status-seal ${status === 'completed' ? (outcome === 'victory' ? 'completed' : 'abandoned') : status}`}
            >
              {getStatusLabel()}
            </span>
          </div>
        </div>
        <div className="expedition-id">#{seedShort}</div>
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ 
          fontSize: '0.75rem', 
          color: 'var(--ink-muted)', 
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem'
        }}>
          {mode === 'normal' ? 'Standard Realm' : 'Expanded Realm'}
        </div>
        <ResourceHexGrid resources={resourceSummary} />
      </div>

      {notes && (
        <div style={{ 
          marginTop: '0.75rem', 
          padding: '0.5rem', 
          background: 'rgba(139, 38, 53, 0.05)',
          borderLeft: '2px solid var(--seal-red)',
          fontSize: '0.875rem',
          fontStyle: 'italic',
          color: 'var(--ink-light)'
        }}>
          "{notes}"
        </div>
      )}

      <div style={{ 
        marginTop: '1rem', 
        display: 'flex', 
        gap: '0.5rem',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="ink-button" 
            onClick={() => onViewDetails(id)}
          >
            View Details
          </button>
          <button 
            className="ink-button" 
            onClick={handleCopySeed}
            title="Copy full seed to clipboard"
            disabled={copied}
          >
            {copied ? (
              <>
                <span style={{ marginRight: '0.25rem' }}>✓</span>
                Copied!
              </>
            ) : (
              <>
                <span style={{ marginRight: '0.25rem' }}>📋</span>
                Copy Seed
              </>
            )}
          </button>
        </div>
        
        {status === 'preparing' && (
          <button 
            className="wax-seal small" 
            onClick={() => onLaunch(id)}
          >
            Launch
          </button>
        )}
      </div>
    </div>
  );
}

export default BoardCard;
import { useState } from 'react';
import '../../styles/cartographer-theme.css';

function ResourceHexGrid({ resources }) {
  const hexTiles = [];
  
  Object.entries(resources || {}).forEach(([resource, count]) => {
    for (let i = 0; i < count; i++) {
      hexTiles.push(resource);
    }
  });

  return (
    <div className="resource-hex-grid" style={{ transform: 'scale(0.8)', transformOrigin: 'left' }}>
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

function ShareModal({ expedition, onClose }) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}?expedition=${expedition.id}`;
  
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getOutcomeLabel = () => {
    if (expedition.status !== 'completed') return 'In Progress';
    return expedition.outcome === 'victory' ? 'Victory' : 'Defeat';
  };

  const getOutcomeClass = () => {
    if (expedition.status !== 'completed') return 'preparing';
    return expedition.outcome === 'victory' ? 'completed' : 'abandoned';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-parchment" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Share Expedition</h2>
          <p className="text-accent" style={{ margin: 0 }}>
            Share this board with fellow cartographers
          </p>
        </div>

        {/* Preview Card */}
        <div style={{ 
          background: 'var(--parchment-light)',
          border: '2px solid var(--parchment-border)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '0.75rem'
          }}>
            <div>
              <span className={`status-seal ${getOutcomeClass()}`} style={{ fontSize: '0.75rem' }}>
                {getOutcomeLabel()}
              </span>
              <div style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '0.875rem',
                color: 'var(--ink)',
                marginTop: '0.5rem'
              }}>
                {expedition.mode === 'normal' ? 'Standard Realm' : 'Expanded Realm'}
              </div>
            </div>
            <div style={{ 
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              color: 'var(--burgundy)'
            }}>
              #{expedition.boardSeed?.substring(0, 6)}
            </div>
          </div>

          <ResourceHexGrid resources={expedition.resourceSummary} />

          {expedition.winnerName && (
            <div style={{ 
              marginTop: '0.75rem',
              padding: '0.5rem',
              background: 'rgba(139, 38, 53, 0.1)',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              <strong>Winner:</strong> {expedition.winnerName}
              {expedition.playerCount && (
                <span style={{ color: 'var(--slate-muted)', marginLeft: '0.5rem' }}>
                  ({expedition.playerCount} players)
                </span>
              )}
            </div>
          )}

          {expedition.notes && (
            <div style={{ 
              marginTop: '0.75rem',
              fontStyle: 'italic',
              fontSize: '0.875rem',
              color: 'var(--slate-muted)'
            }}>
              "{expedition.notes.substring(0, 100)}{expedition.notes.length > 100 ? '...' : ''}"
            </div>
          )}
        </div>

        {/* URL Display */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            fontFamily: 'var(--font-heading)',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
            color: 'var(--ink)'
          }}>
            Shareable Link
          </label>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={shareUrl}
              readOnly
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid var(--parchment-border)',
                borderRadius: '4px',
                background: 'var(--parchment-light)',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'var(--slate)'
              }}
            />
            <button
              onClick={handleCopyUrl}
              className="wax-seal small"
              style={{ whiteSpace: 'nowrap' }}
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ 
          background: 'rgba(139, 38, 53, 0.05)',
          border: '1px solid var(--parchment-border)',
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>
            What will be shared:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--slate-muted)' }}>
            <li>Board configuration and seed</li>
            <li>Game mode (Standard/Expanded)</li>
            <li>Resource layout</li>
            {expedition.status === 'completed' && (
              <li>Winner and player count</li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="ink-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;

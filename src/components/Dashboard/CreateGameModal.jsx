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
    <div className="resource-hex-grid" style={{ transform: 'scale(0.75)', transformOrigin: 'center' }}>
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

function CreateGameModal({ expedition, onClose, onRecordResult }) {
  const [activeTab, setActiveTab] = useState('record');
  const [winnerName, setWinnerName] = useState('');
  const [playerCount, setPlayerCount] = useState('3');
  const [outcome, setOutcome] = useState('victory');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}?expedition=${expedition.id}`;

  const handleSaveResults = () => {
    onRecordResult({
      outcome,
      winnerName: winnerName.trim(),
      playerCount: parseInt(playerCount, 10),
      notes: notes.trim()
    });
  };

  const handleInviteFriends = () => {
    console.log('Invite friends to game:', expedition.id);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getModeLabel = () => {
    return expedition.mode === 'normal' ? 'Standard Realm' : 'Expanded Realm';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-parchment" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--parchment-border)'
        }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem 0' }}>Create Game</h2>
            <p className="text-accent" style={{ margin: 0, fontSize: '0.875rem' }}>
              Chronicle your expedition or summon allies
            </p>
          </div>
          <button
            onClick={onClose}
            className="ink-button"
            style={{ 
              padding: '0.5rem',
              minWidth: 'auto',
              fontSize: '1.25rem'
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="ledger-tabs" style={{ marginBottom: '1.5rem' }}>
          <button
            className={`ledger-tab ${activeTab === 'record' ? 'active' : ''}`}
            onClick={() => setActiveTab('record')}
          >
            Record Finished Game
          </button>
          <button
            className={`ledger-tab ${activeTab === 'propose' ? 'active' : ''}`}
            onClick={() => setActiveTab('propose')}
          >
            Propose Upcoming Game
          </button>
        </div>

        {/* Record Finished Game Section */}
        {activeTab === 'record' && (
          <div className="scroll-card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                color: 'var(--ink)'
              }}>
                Winner's Name
              </label>
              <input
                type="text"
                value={winnerName}
                onChange={(e) => setWinnerName(e.target.value)}
                placeholder="Enter the champion's name..."
                className="parchment-input"
              />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  color: 'var(--ink)'
                }}>
                  Player Count
                </label>
                <select
                  value={playerCount}
                  onChange={(e) => setPlayerCount(e.target.value)}
                  className="parchment-input"
                  style={{ cursor: 'pointer' }}
                >
                  {[3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} Players</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  color: 'var(--ink)'
                }}>
                  Outcome
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setOutcome('victory')}
                    className="ink-button"
                    style={{
                      flex: 1,
                      background: outcome === 'victory' ? 'rgba(61, 90, 74, 0.15)' : 'transparent',
                      borderColor: outcome === 'victory' ? 'var(--forest)' : 'var(--parchment-border)',
                      color: outcome === 'victory' ? 'var(--forest)' : 'var(--slate-light)'
                    }}
                  >
                    Victory
                  </button>
                  <button
                    onClick={() => setOutcome('defeat')}
                    className="ink-button"
                    style={{
                      flex: 1,
                      background: outcome === 'defeat' ? 'rgba(114, 47, 55, 0.1)' : 'transparent',
                      borderColor: outcome === 'defeat' ? 'var(--burgundy)' : 'var(--parchment-border)',
                      color: outcome === 'defeat' ? 'var(--burgundy)' : 'var(--slate-light)'
                    }}
                  >
                    Defeat
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                color: 'var(--ink)'
              }}>
                Chronicle Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record memorable moments, strategies, or observations from this expedition..."
                className="parchment-input"
                rows={4}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <button
              onClick={handleSaveResults}
              className="wax-seal"
              style={{ width: '100%' }}
            >
              Save Results
            </button>
          </div>
        )}

        {/* Propose Upcoming Game Section */}
        {activeTab === 'propose' && (
          <div className="scroll-card" style={{ padding: '1.5rem' }}>
            {/* Board Preview */}
            <div style={{
              background: 'var(--parchment-light)',
              border: '2px solid var(--parchment-border)',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div>
                  <span className="status-seal preparing" style={{ fontSize: '0.75rem' }}>
                    Preparing
                  </span>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1rem',
                    color: 'var(--ink)',
                    marginTop: '0.5rem'
                  }}>
                    {getModeLabel()}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.125rem',
                  color: 'var(--burgundy)'
                }}>
                  #{expedition.boardSeed?.substring(0, 6)}
                </div>
              </div>

              <ResourceHexGrid resources={expedition.resourceSummary} />
            </div>

            {/* Invite Button */}
            <button
              onClick={handleInviteFriends}
              className="wax-seal"
              style={{ width: '100%', marginBottom: '1.25rem' }}
            >
              Invite Friends
            </button>

            {/* Shareable Link */}
            <div>
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
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.75rem',
                color: 'var(--slate-muted)',
                fontStyle: 'italic'
              }}>
                Send this link to fellow cartographers to invite them to join
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateGameModal;

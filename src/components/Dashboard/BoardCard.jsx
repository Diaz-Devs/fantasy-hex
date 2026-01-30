import { useState } from 'react';
import { formatDateMedieval, formatDate } from '../../utils/expeditionHistory';
import ShareModal from './ShareModal';
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
  const [showShareModal, setShowShareModal] = useState(false);
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
          <div className="expedition-status-wrapper">
            <span 
              className={`status-seal ${status === 'completed' ? (outcome === 'victory' ? 'completed' : 'abandoned') : status}`}
            >
              {getStatusLabel()}
            </span>
          </div>
        </div>
        <div className="expedition-id">#{seedShort}</div>
      </div>

      <div className="expedition-mode-section">
        <div className="expedition-mode-label">
          {mode === 'normal' ? 'Standard Realm' : 'Expanded Realm'}
        </div>
        <ResourceHexGrid resources={resourceSummary} />
      </div>

      {notes && (
        <div className="expedition-notes">
          "{notes}"
        </div>
      )}

      <div className="expedition-actions">
        <div className="expedition-actions-primary">
          <button 
            className="ink-button expedition-btn" 
            onClick={() => onViewDetails(id)}
          >
            View Details
          </button>
          <button 
            className="ink-button expedition-btn" 
            onClick={handleCopySeed}
            title="Copy full seed to clipboard"
            disabled={copied}
          >
            {copied ? (
              <>
                <span className="btn-icon">✓</span>
                Copied!
              </>
            ) : (
              <>
                <span className="btn-icon">📋</span>
                Copy Seed
              </>
            )}
          </button>
          <button 
            className="ink-button expedition-btn" 
            onClick={() => setShowShareModal(true)}
            title="Share this expedition"
          >
            <span className="btn-icon">🔗</span>
            Share Result
          </button>
        </div>
        
        {status === 'preparing' && (
          <button 
            className="wax-seal small expedition-launch-btn" 
            onClick={() => onLaunch(id)}
          >
            Launch
          </button>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          expedition={expedition}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

export default BoardCard;

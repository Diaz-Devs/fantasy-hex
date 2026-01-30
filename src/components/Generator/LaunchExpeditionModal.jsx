import { useState, useEffect } from 'react';
import { 
  createExpedition, 
  checkDuplicateSeed, 
  checkStorageLimit 
} from '../../utils/expeditionHistory';
import '../../styles/cartographer-theme.css';

function LaunchExpeditionModal({ boardData, onClose, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [playerCount, setPlayerCount] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [storageWarning, setStorageWarning] = useState(null);

  useEffect(() => {
    // Check for duplicate seed
    const duplicate = checkDuplicateSeed(boardData?.seed);
    if (duplicate) {
      setDuplicateWarning({
        existing: duplicate,
        message: `An expedition with this board configuration already exists (${duplicate.status}).`
      });
    }

    // Check storage limit
    const storageCheck = checkStorageLimit();
    if (storageCheck.warning) {
      setStorageWarning(storageCheck);
    }
  }, [boardData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = createExpedition({
      seed: boardData.seed,
      mode: boardData.mode,
      houseRules: boardData.houseRules,
      resourceSummary: boardData.resourceSummary,
      numberDistribution: boardData.numberDistribution,
      notes: notes.trim(),
      playerCount: parseInt(playerCount, 10)
    });

    if (result.success) {
      onSuccess(result.expedition);
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  const handleProceedAnyway = () => {
    setDuplicateWarning(null);
  };

  if (!boardData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-parchment" onClick={e => e.stopPropagation()}>
          <div className="empty-state">
            <h3>No Board Data</h3>
            <p>Please generate a board first before launching an expedition.</p>
            <button className="wax-seal" onClick={onClose} style={{ marginTop: '1rem' }}>
              Return to Chamber
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-parchment" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Launch Expedition</h2>
          <p className="text-accent" style={{ margin: 0 }}>
            Board #{boardData.seed?.substring(0, 8)}
          </p>
        </div>

        {storageWarning?.critical && (
          <div className="warning-banner" style={{ marginBottom: '1rem' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <span>{storageWarning.message}</span>
          </div>
        )}

        {duplicateWarning && (
          <div className="warning-banner" style={{ marginBottom: '1rem' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <div>
              <strong>Duplicate Board Detected</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                {duplicateWarning.message}
              </p>
              <button 
                className="ink-button" 
                onClick={handleProceedAnyway}
                style={{ marginTop: '0.5rem' }}
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="field" style={{ display: 'block', marginBottom: '0.5rem' }}>
              <span className="field-label" style={{ 
                display: 'block', 
                fontFamily: 'var(--font-heading)',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                color: 'var(--ink)'
              }}>
                Player Count
              </span>
              <select 
                className="parchment-input"
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
                <option value={5}>5 Players</option>
                <option value={6}>6 Players</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="field" style={{ display: 'block' }}>
              <span className="field-label" style={{ 
                display: 'block', 
                fontFamily: 'var(--font-heading)',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                color: 'var(--ink)'
              }}>
                Expedition Notes
              </span>
              <textarea
                className="parchment-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record any observations about this board configuration..."
                rows={4}
                style={{ 
                  width: '100%',
                  resize: 'vertical',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </label>
          </div>

          {error && (
            <div style={{ 
              padding: '0.75rem', 
              background: 'rgba(139, 38, 53, 0.1)',
              border: '1px solid var(--seal-red)',
              borderRadius: '4px',
              color: 'var(--seal-red)',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              type="button"
              className="ink-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="wax-seal"
              disabled={isSubmitting || storageWarning?.critical}
            >
              {isSubmitting ? 'Creating...' : 'Launch Expedition'}
            </button>
          </div>
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          paddingTop: '1rem',
          borderTop: '1px solid var(--parchment-shadow)',
          textAlign: 'center'
        }}>
          <p className="text-small text-muted" style={{ margin: 0 }}>
            <strong>Realm Type:</strong> {boardData.mode === 'normal' ? 'Standard' : 'Expanded'}<br/>
            <strong>Resources:</strong> {Object.values(boardData.resourceSummary || {}).reduce((a, b) => a + b, 0)} tiles
          </p>
        </div>
      </div>
    </div>
  );
}

export default LaunchExpeditionModal;
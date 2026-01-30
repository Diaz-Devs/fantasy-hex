import { useState, useEffect, useCallback, useRef } from 'react';
import LaunchExpeditionModal from '../components/Generator/LaunchExpeditionModal';
import { getExpedition, createExpedition, formatDateMedieval } from '../utils/expeditionHistory';
import '../styles/cartographer-theme.css';

function ResourceHexGrid({ resources }) {
  const hexTiles = [];
  
  Object.entries(resources || {}).forEach(([resource, count]) => {
    for (let i = 0; i < count; i++) {
      hexTiles.push(resource);
    }
  });

  return (
    <div className="resource-hex-grid" style={{ transform: 'scale(0.6)', transformOrigin: 'left' }}>
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

function GeneratorPage({ onReturnToDashboard }) {
  const [boardData, setBoardData] = useState(null);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [seedInput, setSeedInput] = useState('');
  const [sharedExpedition, setSharedExpedition] = useState(null);
  const [expeditionError, setExpeditionError] = useState(null);
  const iframeRef = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 10;
  const urlParamsChecked = useRef(false);

  // Parse URL parameters and load expedition or seed
  useEffect(() => {
    if (urlParamsChecked.current) return;
    urlParamsChecked.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const expeditionId = urlParams.get('expedition');
    const seed = urlParams.get('seed');

    if (expeditionId) {
      // Load expedition from localStorage
      const expedition = getExpedition(expeditionId);
      if (expedition) {
        setSharedExpedition(expedition);
        // Load the board with this expedition's seed
        setTimeout(() => {
          const iframe = iframeRef.current;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ 
              type: 'GENERATE_FROM_SEED', 
              data: { 
                seed: expedition.boardSeed,
                mode: expedition.mode
              } 
            }, '*');
          }
        }, 1000); // Wait for iframe to load
      } else {
        setExpeditionError('This expedition no longer exists');
      }
    } else if (seed) {
      // Load board from seed only
      setTimeout(() => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ 
            type: 'GENERATE_FROM_SEED', 
            data: { seed } 
          }, '*');
        }
      }, 1000);
    }
  }, []);

  // Listen for messages from the generator iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Only accept messages from our generator iframe
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }
      
      const { type, data } = event.data;
      
      switch (type) {
        case 'BOARD_GENERATED':
          setBoardData(data);
          setIsLoading(false);
          setLoadError(false);
          break;
          
        case 'GENERATOR_READY':
          setBoardData(data);
          setIsLoading(false);
          setLoadError(false);
          break;
          
        case 'BOARD_DATA_RESPONSE':
          if (data) {
            setBoardData(data);
            setIsLoading(false);
            setLoadError(false);
          }
          break;
          
        case 'ERROR':
          console.error('Generator error:', data);
          setLoadError(true);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request initial board data with retry logic
    const requestData = () => {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow && retryCount.current < maxRetries) {
        iframe.contentWindow.postMessage({ type: 'GET_BOARD_DATA' }, '*');
        retryCount.current += 1;
      }
    };
    
    // Start requesting data immediately and every 500ms until we get a response
    const intervalId = setInterval(requestData, 500);
    
    // Stop retrying after 5 seconds
    const stopRetryTimer = setTimeout(() => {
      clearInterval(intervalId);
      if (isLoading) {
        setLoadError(true);
      }
    }, 5000);
    
    // Show skip button after 3 seconds
    const skipButtonTimer = setTimeout(() => {
      setShowSkipButton(true);
    }, 3000);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(intervalId);
      clearTimeout(stopRetryTimer);
      clearTimeout(skipButtonTimer);
    };
  }, [isLoading]);

  const handleSkipLoading = () => {
    setIsLoading(false);
    setLoadError(false);
    // Try one more time to get data
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'GET_BOARD_DATA' }, '*');
    }
  };

  const handleLaunchExpedition = () => {
    setShowLaunchModal(true);
  };

  const handleLaunchSuccess = (expedition) => {
    setShowLaunchModal(false);
    console.log('Expedition launched:', expedition);
  };

  const handleGenerateNew = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'REQUEST_NEW_BOARD' }, '*');
    }
    // Clear any shared expedition state
    setSharedExpedition(null);
    setExpeditionError(null);
  };

  const handleGenerateFromSeed = () => {
    const seed = seedInput.trim();
    if (!seed) {
      alert('Please enter a seed');
      return;
    }
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'GENERATE_FROM_SEED', data: { seed } }, '*');
      setSeedInput('');
    }
    // Clear any shared expedition state
    setSharedExpedition(null);
    setExpeditionError(null);
  };

  const handlePlayThisBoard = () => {
    // Clear the expedition data but keep the board
    setSharedExpedition(null);
    setExpeditionError(null);
    // Update URL to remove expedition param but keep seed
    const url = new URL(window.location);
    url.searchParams.delete('expedition');
    if (boardData?.seed) {
      url.searchParams.set('seed', boardData.seed);
    }
    window.history.replaceState({}, '', url);
  };

  const handleRecordResult = () => {
    // Open launch modal with the current board
    setShowLaunchModal(true);
  };

  return (
    <div className="generator-container">
      {/* Header */}
      <div className="generator-header">
        <button
          className="ink-button"
          onClick={onReturnToDashboard}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '0.5rem' }}>
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Return to Guild Hall
        </button>

        <div className="generator-title">
          The Drafting Chamber
        </div>

        <div className="generator-header-actions">
          <button
            className="ink-button"
            onClick={handleGenerateNew}
            disabled={isLoading}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '0.5rem' }}>
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
            Generate New
          </button>

          <input
            type="text"
            className="seed-input"
            placeholder="Enter seed..."
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateFromSeed()}
            disabled={isLoading}
          />
          <button
            className="ink-button small"
            onClick={handleGenerateFromSeed}
            disabled={isLoading}
          >
            Load
          </button>

          <button
            className="wax-seal small"
            onClick={handleLaunchExpedition}
            disabled={!boardData}
          >
            Launch
          </button>
        </div>
      </div>

      {/* Expedition Error Banner */}
      {expeditionError && (
        <div style={{
          background: 'rgba(139, 38, 53, 0.1)',
          border: '1px solid var(--seal-red)',
          borderRadius: '4px',
          padding: '0.75rem 1rem',
          margin: '0 1rem 1rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--seal-red)'
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <span>{expeditionError}</span>
          <button 
            className="ink-button" 
            onClick={() => setExpeditionError(null)}
            style={{ marginLeft: 'auto' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Previous Game Results Section */}
      {sharedExpedition && (
        <div style={{
          background: 'var(--parchment)',
          border: '2px solid var(--burgundy)',
          borderRadius: '8px',
          padding: '1rem 1.5rem',
          margin: '0 1rem 1rem 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.75rem'
          }}>
            <div>
              <h3 style={{ 
                margin: '0 0 0.25rem 0', 
                fontFamily: 'var(--font-heading)',
                color: 'var(--burgundy)'
              }}>
                Previous Game Results
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--slate-muted)' }}>
                This board was played on {formatDateMedieval(sharedExpedition.playDate || sharedExpedition.createdAt)}
              </p>
            </div>
            <span className={`status-seal ${sharedExpedition.outcome === 'victory' ? 'completed' : 'abandoned'}`}>
              {sharedExpedition.outcome === 'victory' ? 'Victory' : 'Defeat'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <ResourceHexGrid resources={sharedExpedition.resourceSummary} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            background: 'rgba(139, 38, 53, 0.05)',
            borderRadius: '4px'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-muted)', textTransform: 'uppercase' }}>
                Winner
              </div>
              <div style={{ fontWeight: 600, color: 'var(--burgundy)' }}>
                {sharedExpedition.winnerName || 'Unknown'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-muted)', textTransform: 'uppercase' }}>
                Players
              </div>
              <div style={{ fontWeight: 600 }}>
                {sharedExpedition.playerCount || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-muted)', textTransform: 'uppercase' }}>
                Mode
              </div>
              <div style={{ fontWeight: 600 }}>
                {sharedExpedition.mode === 'normal' ? 'Standard' : 'Expanded'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-muted)', textTransform: 'uppercase' }}>
                Seed
              </div>
              <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                #{sharedExpedition.boardSeed?.substring(0, 8)}
              </div>
            </div>
          </div>

          {sharedExpedition.notes && (
            <div style={{
              fontStyle: 'italic',
              fontSize: '0.875rem',
              color: 'var(--slate)',
              marginBottom: '1rem',
              padding: '0.5rem',
              borderLeft: '3px solid var(--parchment-border)',
              paddingLeft: '0.75rem'
            }}>
              "{sharedExpedition.notes}"
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="wax-seal small"
              onClick={handlePlayThisBoard}
            >
              Play This Board (Fresh)
            </button>
            <button 
              className="ink-button"
              onClick={handleRecordResult}
            >
              Record Your Result
            </button>
          </div>
        </div>
      )}

      {/* Generator Frame */}
      <div className="generator-frame-container">
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            textAlign: 'center',
            background: 'var(--parchment)',
            padding: '2rem 3rem',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            border: '1px solid var(--parchment-border)'
          }}>
            <div className="loading-seal" style={{ minHeight: 'auto', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px' }}></div>
            </div>
            
            {loadError ? (
              <>
                <p style={{ color: 'var(--burgundy)', marginBottom: '1rem', fontWeight: 500 }}>
                  Taking longer than expected...
                </p>
                <p className="text-small" style={{ color: 'var(--slate-muted)', marginBottom: '1.5rem' }}>
                  The chamber may be ready. You can proceed manually.
                </p>
              </>
            ) : (
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                Loading the Drafting Chamber...
              </p>
            )}
            
            {showSkipButton && (
              <button 
                className="wax-seal small"
                onClick={handleSkipLoading}
                style={{ minWidth: '140px' }}
              >
                {loadError ? 'Enter Chamber' : 'Skip Loading'}
              </button>
            )}
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          id="catan-generator"
          title="Catan Map Generator"
          src={`${import.meta.env.BASE_URL}catan/index.html`}
          className="generator-frame"
          style={{ opacity: isLoading ? 0.3 : 1 }}
        />
      </div>

      {/* Board Summary (when data available) */}
      {boardData && (
        <div className="generator-board-summary">
          <div className="summary-row">
            <div className="summary-item compact">
              <span>Seed: #{boardData.seed?.substring(0, 6)}</span>
              <span className="summary-separator">|</span>
              <span>Mode: {boardData.mode === 'normal' ? 'Standard' : 'Expanded'}</span>
              <span className="summary-separator">|</span>
              <span>Tiles: {Object.values(boardData.resourceSummary || {}).reduce((a, b) => a + b, 0)}</span>
            </div>
            <button
              className="wax-seal small"
              onClick={handleLaunchExpedition}
            >
              Launch Expedition
            </button>
          </div>
        </div>
      )}

      {/* Launch Modal */}
      {showLaunchModal && (
        <LaunchExpeditionModal
          boardData={boardData}
          onClose={() => setShowLaunchModal(false)}
          onSuccess={handleLaunchSuccess}
        />
      )}
    </div>
  );
}

export default GeneratorPage;

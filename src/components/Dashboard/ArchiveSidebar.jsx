import { useState, useMemo } from 'react';
import { getExpeditions, checkStorageLimit, formatDate } from '../../utils/expeditionHistory';
import '../../styles/cartographer-theme.css';

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'log', label: 'History' },
  { id: 'friends', label: 'Friends' },
  { id: 'notices', label: 'Notices' }
];

function ExpeditionLogEntry({ expedition }) {
  const { boardSeed, createdAt, status, outcome, playerCount, winnerName, notes } = expedition;
  
  return (
    <div style={{ 
      padding: '1rem', 
      borderBottom: '1px solid var(--parchment-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '0.875rem',
          marginBottom: '0.25rem'
        }}>
          Expedition #{boardSeed.substring(0, 8)}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--slate-muted)' }}>
          {formatDate(createdAt)} • {playerCount || '?'} players
        </div>
        {notes && (
          <div style={{ 
            fontSize: '0.8125rem', 
            fontStyle: 'italic', 
            color: 'var(--slate-muted)',
            marginTop: '0.5rem'
          }}>
            {notes}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        {status === 'completed' && (
          <div style={{ 
            fontFamily: 'var(--font-heading)',
            fontSize: '0.875rem',
            color: outcome === 'victory' ? '#38a169' : '#8b2635'
          }}>
            {outcome === 'victory' ? 'Victory' : 'Defeat'}
          </div>
        )}
        {winnerName && (
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-muted)' }}>
            Winner: {winnerName}
          </div>
        )}
      </div>
    </div>
  );
}

function ArchiveSidebar({ onViewAll }) {
  const [activeTab, setActiveTab] = useState('active');
  const [page, setPage] = useState(1);
  
  const storageLimit = useMemo(() => checkStorageLimit(), []);
  
  const activeExpeditions = useMemo(() => {
    return getExpeditions({ status: 'preparing', page, perPage: 5 });
  }, [page]);
  
  const completedExpeditions = useMemo(() => {
    return getExpeditions({ status: 'completed', page, perPage: 5 });
  }, [page]);

  const renderActiveTab = () => (
    <div>
      {activeExpeditions.expeditions.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-muted)' }}>
          <p>No active preparations</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Draft a new map to begin an expedition
          </p>
        </div>
      ) : (
        <>
          {activeExpeditions.expeditions.map(exp => (
            <ExpeditionLogEntry key={exp.id} expedition={exp} />
          ))}
          {activeExpeditions.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span className="pagination-info">
                Page {page} of {activeExpeditions.totalPages}
              </span>
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(activeExpeditions.totalPages, p + 1))}
                disabled={page === activeExpeditions.totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderLogTab = () => (
    <div>
      {completedExpeditions.expeditions.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-muted)' }}>
          <p>No completed expeditions yet</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Launch an expedition and record the outcome
          </p>
        </div>
      ) : (
        <>
          {completedExpeditions.expeditions.map(exp => (
            <ExpeditionLogEntry key={exp.id} expedition={exp} />
          ))}
          {completedExpeditions.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span className="pagination-info">
                Page {page} of {completedExpeditions.totalPages}
              </span>
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(completedExpeditions.totalPages, p + 1))}
                disabled={page === completedExpeditions.totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderFriendsTab = () => (
    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
      <div style={{
        display: 'inline-block',
        padding: '0.375rem 0.75rem',
        background: 'var(--gold)',
        color: 'var(--parchment)',
        fontSize: '0.75rem',
        fontWeight: '600',
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        Coming Soon
      </div>
      
      <h4 style={{ 
        fontFamily: 'var(--font-heading)', 
        fontSize: '1rem', 
        margin: '0 0 0.75rem 0',
        color: 'var(--charcoal)'
      }}>
        Fellow Cartographers
      </h4>
      
      <p style={{ 
        fontSize: '0.875rem', 
        color: 'var(--slate-muted)', 
        margin: '0 0 1.5rem 0',
        lineHeight: '1.5'
      }}>
        Connect with other realm builders, share maps, and embark on expeditions together. 
        This feature is currently in development.
      </p>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--parchment-border)',
            border: '2px dashed var(--slate-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem'
          }}>
            👤
          </div>
        ))}
      </div>
      
      <button 
        className="ink-button"
        onClick={() => console.log('Notify me when friends feature launches')}
      >
        Get Notified When Available
      </button>
    </div>
  );

  const renderNoticesTab = () => (
    <div style={{ padding: '1rem' }}>
      <div style={{ 
        padding: '1rem', 
        background: 'rgba(212, 175, 55, 0.1)',
        borderLeft: '3px solid var(--gold)',
        marginBottom: '1rem'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem' }}>
          🎉 Welcome to the Cartographer's Guild
        </h4>
        <p style={{ fontSize: '0.875rem', margin: 0 }}>
          Draft maps, launch expeditions, and track your victories. 
          This is your central command for all realm-building activities.
        </p>
      </div>
      
      <div style={{ 
        padding: '1rem', 
        background: 'rgba(139, 38, 53, 0.05)',
        borderLeft: '3px solid var(--burgundy)',
        marginBottom: '1rem'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem' }}>
          📋 Guild Rank System
        </h4>
        <ul style={{ fontSize: '0.875rem', margin: 0, paddingLeft: '1.25rem' }}>
          <li>Novice: 0-4 expeditions</li>
          <li>Apprentice: 5-9 expeditions</li>
          <li>Journeyman: 10-24 expeditions</li>
          <li>Senior: 25-49 expeditions</li>
          <li>Master: 50+ expeditions</li>
        </ul>
      </div>
      
      <div style={{ 
        padding: '1rem', 
        background: 'rgba(74, 85, 104, 0.1)',
        borderLeft: '3px solid var(--slate-muted)'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem' }}>
          ⚙️ Version 1.0 — The Foundation
        </h4>
        <p style={{ fontSize: '0.875rem', margin: 0 }}>
          • Map generator with 6 house rules<br/>
          • Expedition tracking & history<br/>
          • Win/loss recording<br/>
          • Resource visualization
        </p>
      </div>
    </div>
  );

  return (
    <div className="parchment scroll-card" style={{ height: 'fit-content' }}>
      <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>The Archive</h3>
      
      {storageLimit.warning && (
        <div className={`warning-banner ${storageLimit.critical ? '' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <span style={{ fontSize: '0.875rem' }}>{storageLimit.message}</span>
        </div>
      )}
      
      <div className="ledger-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`ledger-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div style={{ minHeight: '300px' }}>
        {activeTab === 'active' && renderActiveTab()}
        {activeTab === 'log' && renderLogTab()}
        {activeTab === 'friends' && renderFriendsTab()}
        {activeTab === 'notices' && renderNoticesTab()}
      </div>
      
      {(activeTab === 'active' || activeTab === 'log') && (
        <div style={{ 
          marginTop: '1rem', 
          paddingTop: '1rem',
          borderTop: '1px solid var(--parchment-border)',
          textAlign: 'center'
        }}>
          <button 
            className="ink-button" 
            onClick={onViewAll}
          >
            View Full Archive →
          </button>
        </div>
      )}
    </div>
  );
}

export default ArchiveSidebar;
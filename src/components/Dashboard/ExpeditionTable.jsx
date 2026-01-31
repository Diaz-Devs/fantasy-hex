import { useMemo } from 'react';
import { getRecentExpeditions } from '../../utils/expeditionHistory';
import BoardCard from './BoardCard';
import '../../styles/cartographer-theme.css';

function ExpeditionTable({ onViewDetails, onRecordResult }) {
  const recentExpeditions = useMemo(() => {
    return getRecentExpeditions(6);
  }, []);

  if (recentExpeditions.length === 0) {
    return (
      <div className="parchment scroll-card" style={{ minHeight: '400px' }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 10L70 30V60L40 80L10 60V30L40 10Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M40 10V45" stroke="currentColor" strokeWidth="2"/>
              <path d="M40 45L70 30" stroke="currentColor" strokeWidth="2"/>
              <path d="M40 45L10 30" stroke="currentColor" strokeWidth="2"/>
              <circle cx="40" cy="45" r="5" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3>The Map Table Awaits</h3>
          <p>
            No expeditions have been launched yet. Visit the Drafting Chamber to create 
            your first realm and begin your cartographic journey.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="parchment" style={{ padding: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--parchment-shadow)',
        paddingBottom: '1rem'
      }}>
        <h2 style={{ margin: 0 }}>Recent Expeditions</h2>
        <span className="text-muted" style={{ fontSize: '0.875rem' }}>
          Showing last {recentExpeditions.length} of your journey
        </span>
      </div>

      <div className="expedition-grid">
        {recentExpeditions.map(expedition => (
          <BoardCard
            key={expedition.id}
            expedition={expedition}
            onViewDetails={onViewDetails}
            onRecordResult={onRecordResult}
          />
        ))}
      </div>
    </div>
  );
}

export default ExpeditionTable;
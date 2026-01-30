import { useMemo } from 'react';
import { getStats, formatDateMedieval } from '../../utils/expeditionHistory';
import '../../styles/cartographer-theme.css';

function CartographerBadge({ user, onLaunchGenerator }) {
  const stats = useMemo(() => {
    return getStats();
  }, []);

  // Get user's initials for the seal
  const initials = useMemo(() => {
    if (!user?.name) return '??';
    return user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }, [user]);

  // Calculate member since date
  const memberSince = useMemo(() => {
    if (stats.memberSince) {
      return formatDateMedieval(stats.memberSince);
    }
    return formatDateMedieval(new Date().toISOString());
  }, [stats.memberSince]);

  return (
    <div className="badge-container parchment scroll-card">
      <div className="badge-seal">
        {initials}
      </div>
      
      <div className="badge-info" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>
          {user?.name || 'Cartographer'}
        </h3>
        <span className="text-accent" style={{ fontSize: '0.875rem' }}>
          {stats.guildRank}
        </span>
      </div>

      <div className="badge-stats">
        <div className="stat-item">
          <span className="stat-label">Expeditions Launched</span>
          <span className="stat-value">{stats.totalExpeditionsLaunched}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Realms Charted</span>
          <span className="stat-value">{stats.totalRealmsCharted}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Victories</span>
          <span className="stat-value" style={{ color: '#38a169' }}>
            {stats.victories}
          </span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Defeats</span>
          <span className="stat-value" style={{ color: '#8b2635' }}>
            {stats.defeats}
          </span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Guild Member Since</span>
          <span className="stat-value text-small">{memberSince}</span>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          className="wax-seal large" 
          onClick={onLaunchGenerator}
          style={{ width: '100%' }}
        >
          Draft New Map
        </button>
      </div>
    </div>
  );
}

export default CartographerBadge;
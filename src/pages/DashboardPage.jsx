import { useEffect, useState } from 'react';
import { initializeWithDemoData } from '../utils/expeditionHistory';
import CartographerBadge from '../components/Dashboard/CartographerBadge';
import ExpeditionTable from '../components/Dashboard/ExpeditionTable';
import ArchiveSidebar from '../components/Dashboard/ArchiveSidebar';
import '../styles/cartographer-theme.css';

function DashboardPage({ user, onLaunchGenerator }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize demo data on first load
    initializeWithDemoData();
    setIsInitialized(true);
  }, []);

  const handleViewDetails = (expeditionId) => {
    // TODO: Open expedition detail modal
    console.log('View details for expedition:', expeditionId);
  };

  const handleLaunch = (expeditionId) => {
    // TODO: Mark expedition as active
    console.log('Launch expedition:', expeditionId);
  };

  const handleViewAllArchive = () => {
    // TODO: Show full archive view
    console.log('View full archive');
  };

  if (!isInitialized) {
    return (
      <div className="dashboard-container">
        <div className="loading-seal">
          <div style={{ textAlign: 'center' }}>
            <h3>Preparing the Guild Hall...</h3>
            <p className="text-muted">Gathering your cartographic records</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {/* Left Column: Cartographer Badge */}
        <div>
          <CartographerBadge 
            user={user} 
            onLaunchGenerator={onLaunchGenerator}
          />
        </div>

        {/* Center Column: Expedition Table */}
        <div>
          <ExpeditionTable 
            onViewDetails={handleViewDetails}
            onLaunch={handleLaunch}
          />
        </div>

        {/* Right Column: Archive Sidebar */}
        <div>
          <ArchiveSidebar 
            onViewAll={handleViewAllArchive}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
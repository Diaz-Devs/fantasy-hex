import { useRef } from 'react';
import { initializeWithDemoData } from '../utils/expeditionHistory';
import CartographerBadge from '../components/Dashboard/CartographerBadge';
import ExpeditionTable from '../components/Dashboard/ExpeditionTable';
import ArchiveSidebar from '../components/Dashboard/ArchiveSidebar';
import '../styles/cartographer-theme.css';

function DashboardPage({ user, onLaunchGenerator }) {
  const initialized = useRef(false);
  if (!initialized.current) {
    initializeWithDemoData();
    initialized.current = true;
  }

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
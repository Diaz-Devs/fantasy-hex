// Expedition History Manager
// Handles all localStorage operations for expedition tracking

const STORAGE_KEY = '_expeditionArchive_v1';
const SCHEMA_VERSION = 1;
const MAX_EXPEDITIONS_WARNING = 50;
const MAX_EXPEDITIONS_LIMIT = 100;

// Demo data for initial load
const DEMO_EXPEDITIONS = [
  {
    id: 'exp_demo_001',
    boardSeed: 'frosthaven',
    createdAt: '2026-01-28T14:30:00Z',
    mode: 'normal',
    houseRules: {
      adjacent_6_8: false,
      adjacent_2_12: false,
      adjacent_same_numbers: false,
      adjacent_same_resource: false,
      desert_in_center: false,
      resource_multiple_6_8: true
    },
    resourceSummary: {
      sheep: 4,
      wheat: 4,
      wood: 4,
      brick: 3,
      ore: 3,
      desert: 1
    },
    numberDistribution: {
      '2': 1, '3': 2, '4': 2, '5': 2, '6': 2, '8': 2, '9': 2, '10': 2, '11': 2, '12': 1
    },
    status: 'completed',
    outcome: 'victory',
    playDate: '2026-01-28T16:45:00Z',
    notes: 'Excellent ore placement in the north. Won via largest army.',
    playerCount: 3,
    winnerName: 'You'
  },
  {
    id: 'exp_demo_002',
    boardSeed: 'dragonspire',
    createdAt: '2026-01-27T10:15:00Z',
    mode: 'expansion',
    houseRules: {
      adjacent_6_8: true,
      adjacent_2_12: false,
      adjacent_same_numbers: false,
      adjacent_same_resource: true,
      desert_in_center: false,
      resource_multiple_6_8: true
    },
    resourceSummary: {
      sheep: 6,
      wheat: 6,
      wood: 6,
      brick: 5,
      ore: 5,
      desert: 2
    },
    numberDistribution: {
      '2': 2, '3': 3, '4': 3, '5': 3, '6': 3, '8': 3, '9': 3, '10': 3, '11': 3, '12': 2
    },
    status: 'completed',
    outcome: 'defeat',
    playDate: '2026-01-27T13:20:00Z',
    notes: 'Expansion mode with friends. Bad wheat positioning cost the game.',
    playerCount: 4,
    winnerName: 'Sarah'
  },
  {
    id: 'exp_demo_003',
    boardSeed: 'thunderhold',
    createdAt: '2026-01-25T09:00:00Z',
    mode: 'normal',
    houseRules: {
      adjacent_6_8: false,
      adjacent_2_12: false,
      adjacent_same_numbers: false,
      adjacent_same_resource: false,
      desert_in_center: false,
      resource_multiple_6_8: false
    },
    resourceSummary: {
      sheep: 4,
      wheat: 4,
      wood: 4,
      brick: 3,
      ore: 3,
      desert: 1
    },
    numberDistribution: {
      '2': 1, '3': 2, '4': 2, '5': 2, '6': 2, '8': 2, '9': 2, '10': 2, '11': 2, '12': 1
    },
    status: 'preparing',
    outcome: null,
    playDate: null,
    notes: 'Perfect balanced board. Saving for tournament play.',
    playerCount: null,
    winnerName: null
  }
];

// Generate unique ID
function generateId() {
  return 'exp_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Get stored data with schema migration check
export function getStorageData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { expeditions: [], stats: getDefaultStats(), schemaVersion: SCHEMA_VERSION };
    }
    
    const data = JSON.parse(stored);
    
    // Schema migration check
    if (data.schemaVersion !== SCHEMA_VERSION) {
      console.warn('Expedition schema version mismatch. Resetting storage.');
      return { expeditions: [], stats: getDefaultStats(), schemaVersion: SCHEMA_VERSION };
    }
    
    return data;
  } catch (error) {
    console.error('Error reading expedition storage:', error);
    return { expeditions: [], stats: getDefaultStats(), schemaVersion: SCHEMA_VERSION };
  }
}

// Default stats structure
function getDefaultStats() {
  return {
    totalExpeditionsLaunched: 0,
    totalRealmsCharted: 0,
    victories: 0,
    defeats: 0,
    favoriteMode: 'normal',
    expeditionsByMode: { normal: 0, expansion: 0 },
    guildRank: 'Novice Cartographer',
    memberSince: new Date().toISOString()
  };
}

// Save data to storage
function saveStorageData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      return false;
    }
    console.error('Error saving expedition storage:', error);
    return false;
  }
}

// Initialize with demo data if empty
export function initializeWithDemoData() {
  const data = getStorageData();
  if (data.expeditions.length === 0) {
    data.expeditions = [...DEMO_EXPEDITIONS];
    data.stats = {
      ...getDefaultStats(),
      totalExpeditionsLaunched: 3,
      totalRealmsCharted: 3,
      victories: 1,
      defeats: 1,
      expeditionsByMode: { normal: 2, expansion: 1 },
      memberSince: '2026-01-25T09:00:00Z'
    };
    saveStorageData(data);
    return true;
  }
  return false;
}

// Check for storage limit
export function checkStorageLimit() {
  const data = getStorageData();
  const count = data.expeditions.length;
  
  if (count >= MAX_EXPEDITIONS_LIMIT) {
    return { 
      warning: true, 
      critical: true, 
      message: `Storage full (${count}/${MAX_EXPEDITIONS_LIMIT}). Please export and clear old expeditions.`,
      count 
    };
  }
  
  if (count >= MAX_EXPEDITIONS_WARNING) {
    return { 
      warning: true, 
      critical: false, 
      message: `Approaching storage limit (${count}/${MAX_EXPEDITIONS_LIMIT}). Consider exporting your archive.`,
      count 
    };
  }
  
  return { warning: false, critical: false, message: null, count };
}

// Check if seed already exists
export function checkDuplicateSeed(seed) {
  const data = getStorageData();
  return data.expeditions.find(exp => exp.boardSeed === seed);
}

// Create new expedition
export function createExpedition(boardData) {
  // Check storage limit first
  const limitCheck = checkStorageLimit();
  if (limitCheck.critical) {
    return { success: false, error: limitCheck.message };
  }
  
  // Check for duplicate seed
  const duplicate = checkDuplicateSeed(boardData.seed);
  if (duplicate) {
    return { 
      success: false, 
      error: 'duplicate_seed',
      existingExpedition: duplicate,
      message: `An expedition with seed "${boardData.seed}" already exists (${duplicate.status}).` 
    };
  }
  
  const data = getStorageData();
  
  const expedition = {
    id: generateId(),
    boardSeed: boardData.seed,
    createdAt: new Date().toISOString(),
    mode: boardData.mode || 'normal',
    houseRules: boardData.houseRules || {},
    resourceSummary: boardData.resourceSummary || {},
    numberDistribution: boardData.numberDistribution || {},
    status: 'preparing',
    outcome: null,
    playDate: null,
    notes: boardData.notes || '',
    playerCount: boardData.playerCount || null,
    winnerName: null
  };
  
  data.expeditions.unshift(expedition);
  
  // Update stats
  data.stats.totalExpeditionsLaunched += 1;
  data.stats.totalRealmsCharted += 1;
  data.stats.expeditionsByMode[expedition.mode] = (data.stats.expeditionsByMode[expedition.mode] || 0) + 1;
  
  // Update guild rank
  data.stats.guildRank = calculateGuildRank(data.stats.totalExpeditionsLaunched);
  
  if (saveStorageData(data)) {
    return { success: true, expedition };
  }
  
  return { success: false, error: 'Failed to save expedition' };
}

// Calculate guild rank based on expeditions
function calculateGuildRank(count) {
  if (count >= 50) return 'Master Cartographer';
  if (count >= 25) return 'Senior Cartographer';
  if (count >= 10) return 'Journeyman Cartographer';
  if (count >= 5) return 'Apprentice Cartographer';
  return 'Novice Cartographer';
}

// Get all expeditions with optional filters
export function getExpeditions(filters = {}) {
  const data = getStorageData();
  let expeditions = [...data.expeditions];
  
  // Apply status filter
  if (filters.status) {
    expeditions = expeditions.filter(exp => exp.status === filters.status);
  }
  
  // Apply outcome filter
  if (filters.outcome) {
    expeditions = expeditions.filter(exp => exp.outcome === filters.outcome);
  }
  
  // Apply mode filter
  if (filters.mode) {
    expeditions = expeditions.filter(exp => exp.mode === filters.mode);
  }
  
  // Apply search filter (searches notes and seed)
  if (filters.search) {
    const search = filters.search.toLowerCase();
    expeditions = expeditions.filter(exp => 
      exp.notes.toLowerCase().includes(search) ||
      exp.boardSeed.toLowerCase().includes(search)
    );
  }
  
  // Sort
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';
  expeditions.sort((a, b) => {
    const aVal = new Date(a[sortBy] || a.createdAt);
    const bVal = new Date(b[sortBy] || b.createdAt);
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });
  
  // Pagination
  const page = filters.page || 1;
  const perPage = filters.perPage || 10;
  const total = expeditions.length;
  const start = (page - 1) * perPage;
  const paginated = expeditions.slice(start, start + perPage);
  
  return {
    expeditions: paginated,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage)
  };
}

// Get single expedition by ID
export function getExpedition(id) {
  const data = getStorageData();
  return data.expeditions.find(exp => exp.id === id) || null;
}

// Update expedition (for recording outcomes)
export function updateExpedition(id, updates) {
  const data = getStorageData();
  const index = data.expeditions.findIndex(exp => exp.id === id);
  
  if (index === -1) {
    return { success: false, error: 'Expedition not found' };
  }
  
  const expedition = data.expeditions[index];
  
  // Update fields
  if (updates.status) expedition.status = updates.status;
  if (updates.outcome) {
    expedition.outcome = updates.outcome;
    // Update stats
    if (updates.outcome === 'victory') {
      data.stats.victories += 1;
    } else if (updates.outcome === 'defeat') {
      data.stats.defeats += 1;
    }
  }
  if (updates.playDate) expedition.playDate = updates.playDate;
  if (updates.notes !== undefined) expedition.notes = updates.notes;
  if (updates.playerCount) expedition.playerCount = updates.playerCount;
  if (updates.winnerName !== undefined) expedition.winnerName = updates.winnerName;
  
  data.expeditions[index] = expedition;
  
  if (saveStorageData(data)) {
    return { success: true, expedition };
  }
  
  return { success: false, error: 'Failed to update expedition' };
}

// Delete expedition
export function deleteExpedition(id) {
  const data = getStorageData();
  const index = data.expeditions.findIndex(exp => exp.id === id);
  
  if (index === -1) {
    return { success: false, error: 'Expedition not found' };
  }
  
  const expedition = data.expeditions[index];
  data.expeditions.splice(index, 1);
  
  // Update stats
  data.stats.totalExpeditionsLaunched -= 1;
  data.stats.expeditionsByMode[expedition.mode] -= 1;
  if (expedition.outcome === 'victory') data.stats.victories -= 1;
  if (expedition.outcome === 'defeat') data.stats.defeats -= 1;
  
  // Recalculate rank
  data.stats.guildRank = calculateGuildRank(data.stats.totalExpeditionsLaunched);
  
  if (saveStorageData(data)) {
    return { success: true };
  }
  
  return { success: false, error: 'Failed to delete expedition' };
}

// Get user stats
export function getStats() {
  const data = getStorageData();
  return data.stats;
}

// Export all data as JSON
export function exportData() {
  const data = getStorageData();
  return JSON.stringify(data, null, 2);
}

// Import data from JSON
export function importData(jsonString) {
  try {
    const imported = JSON.parse(jsonString);
    
    if (!imported.expeditions || !imported.stats || !imported.schemaVersion) {
      return { success: false, error: 'Invalid data format' };
    }
    
    if (imported.schemaVersion !== SCHEMA_VERSION) {
      return { success: false, error: 'Incompatible schema version' };
    }
    
    const current = getStorageData();
    
    // Merge or replace (ask user in UI, but here we merge)
    const merged = {
      expeditions: [...current.expeditions, ...imported.expeditions],
      stats: {
        ...current.stats,
        totalExpeditionsLaunched: current.stats.totalExpeditionsLaunched + imported.stats.totalExpeditionsLaunched,
        victories: current.stats.victories + imported.stats.victories,
        defeats: current.stats.defeats + imported.stats.defeats,
      },
      schemaVersion: SCHEMA_VERSION
    };
    
    if (saveStorageData(merged)) {
      return { success: true, count: imported.expeditions.length };
    }
    
    return { success: false, error: 'Failed to save imported data' };
  } catch (error) {
    return { success: false, error: 'Invalid JSON format' };
  }
}

// Clear all expeditions
export function clearAllExpeditions() {
  const data = {
    expeditions: [],
    stats: getDefaultStats(),
    schemaVersion: SCHEMA_VERSION
  };
  return saveStorageData(data);
}

// Get recent expeditions (for dashboard display)
export function getRecentExpeditions(count = 6) {
  const data = getStorageData();
  return data.expeditions.slice(0, count);
}

// Format date for display
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format date in medieval style
export function formatDateMedieval(dateString) {
  const date = new Date(dateString);
  const months = [
    'Janus', 'Februa', 'Martius', 'Aprilis', 'Maius', 'Junius',
    'Julius', 'Augustus', 'September', 'October', 'November', 'December'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

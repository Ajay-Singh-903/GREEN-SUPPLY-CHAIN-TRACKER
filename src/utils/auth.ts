import { User, UserRole } from '../App';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  clientId?: string; // For clients, link to shipment database
}

const USERS_KEY = 'green_supply_users';

// Demo accounts for testing
const DEMO_ACCOUNTS: StoredUser[] = [
  {
    id: 'demo-manager',
    name: 'Manager Demo',
    email: 'manager@demo.com',
    password: 'demo123',
    role: 'manager',
  },
  // Client accounts with client_id as password
  {
    id: 'client-c1',
    name: 'TechCorp Industries',
    email: 'c1@techcorp.com',
    password: 'c1',
    role: 'client',
    clientId: 'c1',
  },
  {
    id: 'client-c2',
    name: 'GreenGoods Co.',
    email: 'c2@greengoods.com',
    password: 'c2',
    role: 'client',
    clientId: 'c2',
  },
  {
    id: 'client-c3',
    name: 'BuildRight Ltd.',
    email: 'c3@buildright.com',
    password: 'c3',
    role: 'client',
    clientId: 'c3',
  },
  {
    id: 'client-c5',
    name: 'EcoShip Solutions',
    email: 'c5@ecoship.com',
    password: 'c5',
    role: 'client',
    clientId: 'c5',
  },
  {
    id: 'client-c6',
    name: 'Pharma Express Ltd.',
    email: 'c6@pharmaexpress.com',
    password: 'c6',
    role: 'client',
    clientId: 'c6',
  },
  {
    id: 'client-c7',
    name: 'Maritime Freight Co.',
    email: 'c7@maritime.com',
    password: 'c7',
    role: 'client',
    clientId: 'c7',
  },
  {
    id: 'client-c8',
    name: 'RetailHub Pvt Ltd.',
    email: 'c8@retailhub.com',
    password: 'c8',
    role: 'client',
    clientId: 'c8',
  },
  {
    id: 'client-c9',
    name: 'AeroFreight Services',
    email: 'c9@aerofreight.com',
    password: 'c9',
    role: 'client',
    clientId: 'c9',
  },
  {
    id: 'client-c10',
    name: 'Industrial Materials Corp.',
    email: 'c10@industrial.com',
    password: 'c10',
    role: 'client',
    clientId: 'c10',
  },
  {
    id: 'client-c11',
    name: 'GroceryChain Distribution',
    email: 'c11@grocery.com',
    password: 'c11',
    role: 'client',
    clientId: 'c11',
  },
  {
    id: 'client-c13',
    name: 'HealthCare Logistics',
    email: 'c13@healthcare.com',
    password: 'c13',
    role: 'client',
    clientId: 'c13',
  },
  {
    id: 'client-c14',
    name: 'FashionTrade Networks',
    email: 'c14@fashion.com',
    password: 'c14',
    role: 'client',
    clientId: 'c14',
  },
];

export function getStoredUsers(): StoredUser[] {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    // Initialize with demo accounts on first load
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_ACCOUNTS));
    return DEMO_ACCOUNTS;
  }
  
  // Merge with demo accounts (in case new demo accounts were added)
  const users = JSON.parse(stored);
  const existingEmails = users.map((u: StoredUser) => u.email);
  const newDemoAccounts = DEMO_ACCOUNTS.filter(demo => !existingEmails.includes(demo.email));
  
  if (newDemoAccounts.length > 0) {
    const merged = [...users, ...newDemoAccounts];
    localStorage.setItem(USERS_KEY, JSON.stringify(merged));
    return merged;
  }
  
  return users;
}

export function saveUser(user: StoredUser): void {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUser(email: string, password: string): StoredUser | null {
  const users = getStoredUsers();
  return users.find(u => u.email === email && u.password === password) || null;
}

export function userExists(email: string): boolean {
  const users = getStoredUsers();
  return users.some(u => u.email === email);
}

export function toPublicUser(storedUser: StoredUser): User {
  return {
    id: storedUser.id,
    name: storedUser.name,
    email: storedUser.email,
    role: storedUser.role,
  };
}

// Get the clientId for a user (for mapping to shipments database)
export function getUserClientId(userId: string): string {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  
  // If user has a clientId, use it
  if (user?.clientId) return user.clientId;
  
  // For new signups, assign them to a client ID based on their index
  const clientIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c13', 'c14'];
  const newUserIndex = users.findIndex(u => u.id === userId);
  return clientIds[newUserIndex % clientIds.length] || 'c1';
}

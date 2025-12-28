import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { ManagerDashboard } from './components/ManagerDashboard';
import { ClientDashboard } from './components/ClientDashboard';

export type UserRole = 'manager' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLanding(true);
  };

  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      {user.role === 'manager' ? (
        <ManagerDashboard user={user} onLogout={handleLogout} />
      ) : (
        <ClientDashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}
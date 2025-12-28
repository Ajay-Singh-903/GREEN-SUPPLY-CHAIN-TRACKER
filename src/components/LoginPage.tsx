import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, UserRole } from '../App';
import { Leaf, Package, AlertCircle } from 'lucide-react';
import { saveUser, findUser, userExists, toPublicUser } from '../utils/auth';
import { Alert, AlertDescription } from './ui/alert';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('manager');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Prevent client signup - clients must log in with pre-registered accounts
    if (!isLogin && role === 'client') {
      setError('All client accounts are pre-registered. Please switch to Sign In tab and use your credentials.');
      setIsLogin(true);
      return;
    }

    if (isLogin) {
      // Login
      const storedUser = findUser(formData.email, formData.password);
      if (storedUser) {
        if (storedUser.role !== role) {
          setError(`This account is registered as ${storedUser.role}. Please select the correct role.`);
          return;
        }
        onLogin(toPublicUser(storedUser));
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } else {
      // Signup (only for managers)
      if (userExists(formData.email)) {
        setError('This email is already registered. Please login instead.');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
      };

      saveUser(newUser);
      onLogin(toPublicUser(newUser));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-3 rounded-xl">
              <Leaf className="size-8 text-white" />
            </div>
          </div>
          <h1 className="text-blue-900 mb-2">Green Supply Chain Tracker</h1>
          <p className="text-blue-700">Monitor and reduce your carbon footprint</p>
        </div>

        <Card className="shadow-xl border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">{isLogin ? 'Sign In' : role === 'client' ? 'Client Sign In' : 'Create Manager Account'}</CardTitle>
            <CardDescription>
              {isLogin
                ? role === 'client'
                  ? 'Enter your pre-registered client credentials to access your dashboard'
                  : 'Enter your credentials to access your dashboard'
                : 'Sign up to create a new manager account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manager">Manager</TabsTrigger>
                <TabsTrigger value="client">Client</TabsTrigger>
              </TabsList>
            </Tabs>

            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="size-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {role === 'client' && isLogin === false && (
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <AlertCircle className="size-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  All client accounts are pre-registered. Please use Sign In tab with your credentials.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && role === 'manager' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-blue-600 hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
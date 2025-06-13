import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement login logic dengan Go backend
    console.log('Login attempt:', { username, password });
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to home on success
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div className="min-h-screen journal-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-serif font-semibold text-primary">Journal</h1>
          </div>
          <p className="text-charcoal/70">Welcome back to your personal sanctuary</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border border-accent/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-serif text-primary">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access your journal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-charcoal/60">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Create one here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-charcoal/50">
            Your safe space for thoughts and reflections
          </p>
        </div>
      </div>
    </div>
  );
}
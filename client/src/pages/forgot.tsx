import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [recoveryKey, setRecoveryKey] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [, navigate] = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!email || !recoveryKey || !newPassword || !confirmPassword) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in all fields.',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please re-enter your new password.',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        try {
            await api.auth.resetPasswordWithRecoveryKey({
                recoveryKey,
                newPassword,
            });

            toast({
                title: 'Password Reset Successful',
                description: 'You can now log in with your new password.',
            });

            navigate('/login');
        } catch (err: any) {
            console.error(err);
            toast({
                title: 'Reset failed',
                description: err?.message || 'Invalid recovery key or email.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen journal-bg flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-primary mr-2" />
                        <h1 className="text-3xl font-serif font-semibold text-primary">Joura</h1>
                    </div>
                    <p className="text-charcoal/70">Reset your password with your recovery key</p>
                </div>

                <Card className="shadow-lg border border-accent/20">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-serif text-primary">Reset Password</CardTitle>
                        <CardDescription>Enter your recovery key and new password</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form noValidate onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recoveryKey">Recovery Key</Label>
                                <Input
                                    id="recoveryKey"
                                    placeholder="Enter your recovery key"
                                    value={recoveryKey}
                                    onChange={(e) => setRecoveryKey(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Reset Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

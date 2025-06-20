import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";

export default function AccountSettings() {
  const [activeSection, setActiveSection] = useState<"password" | "username" | "email" | null>(null);
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.auth.resetPasswordWithRecoveryKey({ recoveryKey, newPassword });
      toast({
        title: "Success",
        description: "Password changed successfully!",
      });
      setRecoveryKey("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await api.auth.changeEmail({ email: newEmail });
      toast({
        title: "Success",
        description: "Email changed successfully!",
      });
      setNewEmail("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to change email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await api.auth.changeUsername({ username: newUsername });
      toast({
        title: "Success",
        description: "Username changed successfully!",
      });
      setNewUsername("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to change username",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (activeSection) {
      case "password":
        return (
          <form className="space-y-4 mt-4" onSubmit={handlePasswordChange}>
            <div>
              <Label htmlFor="recoveryKey">Recovery Key</Label>
              <Input
                type="text"
                id="recoveryKey"
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
          </form>
        );

      case "username":
        return (
          <form className="space-y-4 mt-4" onSubmit={handleUsernameChange}>
            <div>
              <Label htmlFor="newUsername">New Username</Label>
              <Input
                type="text"
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">Change Username</Button>
          </form>
        );

      case "email":
        return (
          <form className="space-y-4 mt-4" onSubmit={handleEmailChange}>
            <div>
              <Label htmlFor="newEmail">New Email</Label>
              <Input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">Change Email</Button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Navigation />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-muted/30">
        <div className="w-full max-w-md mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary font-serif text-2xl">
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveSection("username")}
                >
                  Change Username
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveSection("email")}
                >
                  Change Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveSection("password")}
                >
                  Change Password
                </Button>
              </div>
              {renderForm()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

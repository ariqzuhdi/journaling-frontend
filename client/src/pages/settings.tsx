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

export default function AccountSettings() {
  const [activeSection, setActiveSection] = useState<"password" | "username" | "email" | null>(null);
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.auth.resetPasswordWithRecoveryKey({ recoveryKey, newPassword });
      setSuccess("Password changed successfully!");
      setRecoveryKey("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to change password");
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
          <form className="space-y-4 mt-4">
            <div>
              <Label htmlFor="newUsername">New Username</Label>
              <Input type="text" id="newUsername" />
            </div>
            <Button type="submit" className="w-full">Change Username</Button>
          </form>
        );
      case "email":
        return (
          <form className="space-y-4 mt-4">
            <div>
              <Label htmlFor="newEmail">New Email</Label>
              <Input type="email" id="newEmail" />
            </div>
            <Button type="submit" className="w-full">Change Email</Button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-md">
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
                disabled
              >
                Change Username
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveSection("email")}
                disabled
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
  );
}

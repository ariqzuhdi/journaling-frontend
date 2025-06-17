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

export default function AccountSettings() {
  const [activeSection, setActiveSection] = useState<"password" | "username" | "email" | null>(null);

  const renderForm = () => {
    switch (activeSection) {
      case "password":
        return (
          <form className="space-y-4 mt-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input type="password" id="currentPassword" />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input type="password" id="newPassword" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input type="password" id="confirmPassword" />
            </div>
            <Button type="submit" className="w-full">Change Password</Button>
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
                disabled
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

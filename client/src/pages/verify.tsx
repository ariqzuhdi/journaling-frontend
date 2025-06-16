import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EmailVerificationHandler() {
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );
  const [message, setMessage] = useState("");
  const [location, navigate] = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    // Call backend to verify
    fetch(`${API_BASE_URL}/api/verify?token=${token}`, {
      method: "GET",
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again later.");
      });
  }, []);

  const renderIcon = () => {
    if (status === "success")
      return <CheckCircle className="w-12 h-12 text-green-600" />;
    if (status === "error")
      return <XCircle className="w-12 h-12 text-red-600" />;
    return null;
  };

  return (
    <div className="min-h-screen journal-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="text-center shadow-lg border">
          <CardHeader>
            <div className="flex justify-center mb-2">{renderIcon()}</div>
            <CardTitle className="text-2xl font-serif text-primary">
              {status === "pending"
                ? "Verifying..."
                : status === "success"
                  ? "Success!"
                  : "Verification Failed"}
            </CardTitle>
            <CardDescription className="mt-2 text-charcoal/80">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-primary mt-4"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

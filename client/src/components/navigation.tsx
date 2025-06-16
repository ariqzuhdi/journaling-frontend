import {
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  BookOpen,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLocation } from "wouter";
import { api } from "@/lib/api";

export function Navigation() {
  const { data, isLoading } = useCurrentUser();
  const user = data;
  const [, setLocation] = useLocation();
  const handleLogout = async () => {
    try {
      await api.auth.logout();
      localStorage.removeItem("token");
      setLocation("/login");
    } catch (error) {
    }
  };

  if (isLoading) return null; // atau spinner

  return (
    <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-accent/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <h1 className="text-2xl font-serif font-semibold text-primary cursor-pointer hover:text-primary/80 transition-colors duration-200">
                Joura
              </h1>
            </Link>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
              <Link
                href="/entries"
                className="text-charcoal hover:text-primary transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>My Entries</span>
              </Link>
              {/* <Link href="/"
                className="text-charcoal hover:text-primary transition-colors duration-200 font-medium flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
              </Link> */}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* <Button 
              variant="ghost" 
              size="sm"
              className="p-2 text-charcoal hover:text-primary transition-colors duration-200"
            >
              <Search className="h-4 w-4" />
            </Button> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-charcoal hover:text-primary transition-colors duration-200 p-2"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {user?.username?.charAt(0).toUpperCase() || "G"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block font-medium">
                    {user?.username ?? "Guest"}
                  </span>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator /> */}
                <DropdownMenuItem
                  className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

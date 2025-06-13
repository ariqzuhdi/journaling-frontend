import { Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Navigation() {
  return (
    <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-accent/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-serif font-semibold text-primary">Journal</h1>
            <div className="hidden md:flex space-x-6">
              <a href="#" className="text-charcoal hover:text-primary transition-colors duration-200 font-medium">
                My Entries
              </a>
              <a href="#" className="text-charcoal hover:text-primary transition-colors duration-200 font-medium">
                Insights
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 text-charcoal hover:text-primary transition-colors duration-200"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-charcoal hover:text-primary transition-colors duration-200 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-accent/20 text-primary font-medium text-sm">
                      S
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block font-medium">Sarah</span>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600">
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

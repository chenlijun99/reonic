import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-border bg-card shadow-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="text-2xl font-bold bg-clip-text">
            <Link to="/">EV Charger Simulation</Link>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="transition-smooth"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

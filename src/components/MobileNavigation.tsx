import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, MoreVertical } from 'lucide-react';

interface MobileNavigationProps {
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  rightActions?: React.ReactNode;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  title,
  showBackButton = true,
  showMenuButton = false,
  onMenuClick,
  rightActions
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackClick = () => {
    if (location.pathname.startsWith('/chat/')) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="md:hidden mobile-header flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-secondary/50 text-primary-foreground border-b sticky top-0 z-20">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="mobile-touch-target hover:bg-white/10 text-primary-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="mobile-touch-target hover:bg-white/10 text-primary-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Center Title */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold truncate px-4">
          {title}
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {rightActions}
      </div>
    </div>
  );
};

export default MobileNavigation;
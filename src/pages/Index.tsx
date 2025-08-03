import { useOutletContext } from "react-router-dom";
import HamburgerMenu from "@/components/HamburgerMenu";
import { Users, MessageCircle } from "lucide-react";

interface OutletContext {
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
}

const Index = () => {
  const context = useOutletContext<OutletContext>();
  
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="md:hidden mobile-header py-3 px-4 bg-gradient-to-r from-primary to-secondary/50 text-primary-foreground border-b flex items-center justify-between">
        <HamburgerMenu 
          isActive={context?.leftSidebarOpen || false} 
          onClick={context?.toggleLeftSidebar || (() => {})} 
          className="text-primary-foreground"
        />
        <h1 className="text-lg font-semibold">HereIAm Chat</h1>
        <button
          onClick={context?.toggleRightSidebar || (() => {})}
          className="mobile-touch-target p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Toggle users sidebar"
        >
          <Users className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-mobile safe-area-inset">
      {/* Mobile Welcome Screen */}
      <div className="text-center max-w-sm mx-auto">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-center px-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          HereIAm Chat
        </h1>
        
        <div className="text-muted-foreground text-base sm:text-lg mb-8 text-center px-4 leading-relaxed">
          <div className="mb-2">Real-time messaging</div>
          <div className="mb-2">Voice notes & file sharing</div>
          <div className="text-sm opacity-75">Select a conversation to start chatting</div>
        </div>

        {/* Mobile Instructions */}
        <div className="md:hidden bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">Getting Started</span>
          </div>
          <div className="space-y-2 text-xs leading-relaxed">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                <div className="hamburger-menu w-3 h-3">
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                </div>
              </div>
              <span>Tap menu to see your chats</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                <Users className="w-3 h-3" />
              </div>
              <span>Tap users icon to find people</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
export default Index;
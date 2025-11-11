import { useState } from 'react';
import { X } from 'lucide-react';
import { Outlet } from 'react-router';

import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ConfigurationPanel } from '@/components/ConfigurationPanel';

const Index = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <Header onMenuClick={() => setDrawerOpen(true)} />
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop: Fixed panel */}
          {!isMobile && (
            <div className="w-80 min-w-80">
              <ConfigurationPanel />
            </div>
          )}
          {/* Mobile: Drawer */}
          {isMobile && (
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerContent className="h-[90vh]">
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-end p-4 border-b shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDrawerOpen(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ConfigurationPanel />
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}

          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;

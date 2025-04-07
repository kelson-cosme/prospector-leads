
import React from 'react';
import { LucideShoppingBag, LucideMenu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavbarProps {
  onOpenAddLeadModal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenAddLeadModal }) => {
  const isMobile = useIsMobile();

  return (
    <header className="bg-brand-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <LucideShoppingBag size={24} className="text-white" />
          <span className="text-xl font-bold">Site Seeker</span>
        </div>
        
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-brand-700">
                <LucideMenu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[250px]">
              <nav className="flex flex-col space-y-4 mt-8">
                <Button 
                  variant="default" 
                  onClick={onOpenAddLeadModal}
                  className="w-full bg-brand-600 hover:bg-brand-700"
                >
                  Adicionar Lead
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center space-x-4">
            <Button 
              onClick={onOpenAddLeadModal}
              className="bg-brand-600 hover:bg-brand-700"
            >
              Adicionar Lead
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;

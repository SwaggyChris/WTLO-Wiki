
import React from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface SidebarProps {
  className?: string;
}

export function MapSidebar({ className }: SidebarProps) {
  return (
    <div className={`h-full bg-gray-800 text-white flex flex-col ${className}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold">Menu</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            Map Layers
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Markers
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Settings
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}

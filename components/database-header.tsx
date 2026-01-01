"use client";

import React from "react";
import { Search, Filter } from "lucide-react";

interface DatabaseHeaderProps {
  activeTab: string;
  getTabTitle: (tab: string) => string;
  isSidebarOpen: boolean;
}

export default function DatabaseHeader({ activeTab, getTabTitle, isSidebarOpen }: DatabaseHeaderProps) {
  return (
    <div className={`fixed top-16 left-0 right-0 z-40 w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white flex-shrink-0 ml-[20px]">
        {getTabTitle(activeTab)}
      </h1>
      <div className="flex items-center gap-2 sm:gap-4 max-w-xs">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
              type="text"
              placeholder="Search guides..."
              className="w-48 pl-10 pr-4 py-1 rounded-xl border bg-white text-xs text-black"
            />
        </div>
        <button className="flex-shrink-0 px-4 py-1 rounded-xl border flex items-center justify-center gap-2 text-xs text-black bg-white" title="Advanced Filter">
          <Filter size={14} />
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
}

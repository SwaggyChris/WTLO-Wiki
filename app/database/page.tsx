"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Book, Compass, ArrowLeft, Menu, X, Search, Filter, LayoutGrid, List } from "lucide-react";

export default function DatabasePage() {
  const [activeTab, setActiveTab] = useState("all-guides");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "all-guides":
        return "All Guides";
      case "discover":
        return "Discover";
      case "bestiary":
        return "Bestiary";
      case "armory":
        return "Armory";
      case "infirmary":
        return "Infirmary";
      default:
        return "Database";
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-black">
      {/* Pearl Mist Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.12), transparent 60%), #000000",
        }}
      />
      <div className="relative z-10 p-6">
        {/* Open Sidebar Button for Mobile */}
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="fixed top-6 left-6 z-50 md:hidden p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg" title="Open sidebar">
            <Menu size={20} />
          </button>
        )}

        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        

        {/* Bottom section: Sidebar and Tab Content */}
        <div className={`max-w-screen-2xl mx-auto grid grid-cols-12 gap-6`}>
          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-white/50 shadow-lg shadow-white/30 p-4 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:col-span-3 lg:col-span-2 xl:col-span-2 2xl:col-span-2`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Image src="/GameLogoWhite.png" alt="Will to Live Online" width={32} height={32} className="object-contain" />
                <span className="text-lg font-semibold text-white dark:text-white">WTLO Wiki</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full md:hidden" title="Close sidebar">
                <X size={20} />
              </button>
            </div>
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white transition-colors mb-4">
              <ArrowLeft size={16} />
              <span>Back to Main Page</span>
            </Link>
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab("all-guides")}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "all-guides"
                    ? "bg-gray-700 dark:bg-gray-700 text-white dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Book size={16} />
                <span>All Guides</span>
              </button>
              <button
                onClick={() => setActiveTab("discover")}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "discover"
                    ? "bg-gray-700 dark:bg-gray-700 text-white dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Compass size={16} />
                <span>Discover</span>
              </button>
              <button
                onClick={() => setActiveTab("bestiary")}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "bestiary"
                    ? "bg-gray-700 dark:bg-gray-700 text-white dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Book size={16} /> {/* Using Book icon for Bestiary */}
                <span>Bestiary</span>
              </button>
              <button
                onClick={() => setActiveTab("armory")}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "armory"
                    ? "bg-gray-700 dark:bg-gray-700 text-white dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Book size={16} /> {/* Using Book icon for Armory, can be changed later */}
                <span>Armory</span>
              </button>
              <button
                onClick={() => setActiveTab("infirmary")}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "infirmary"
                    ? "bg-gray-700 dark:bg-gray-700 text-white dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Book size={16} /> {/* Using Book icon for Infirmary, can be changed later */}
                <span>Infirmary</span>
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <main className={`col-span-12 ${isSidebarOpen ? 'md:col-span-9 lg:col-span-10 xl:col-span-10 2xl:col-span-10' : ''} md:ml-64`}>
            {activeTab === "all-guides" && (
              <div className="p-4"> {/* Content for All Guides tab */}
                <h2 className="text-2xl font-bold text-white mb-4">All Guides</h2> {/* Re-added h2 */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search guides..."
                      className="w-full pl-9 pr-3 py-1 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm">
                      <Filter size={16} />
                      <span>Filter</span>
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-colors text-sm ${
                        viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("compact")}
                      className={`p-2 rounded-md transition-colors text-sm ${
                        viewMode === "compact" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                      title="Compact View"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
                {/* Article Cards */}
                <div
                  className={`mt-6 ${
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      : "flex flex-col gap-4"
                  }`}
                >
                  {[
                    {
                      title: "Getting Started in the Zone",
                      description: "Your first steps to survival, from character creation to your first mission.",
                      href: "/articles/getting-started",
                      image: "/placeholder.svg", // Replace with actual image path
                    },
                    {
                      title: "Mastering the Market",
                      description: "Learn how to trade effectively, make profits, and get the best gear.",
                      href: "/articles/market-guide",
                      image: "/placeholder.svg", // Replace with actual image path
                    },
                    {
                      title: "Advanced Combat Tactics",
                      description: "Tips and tricks for taking down the toughest mutants and players.",
                      href: "/articles/combat-tactics",
                      image: "/placeholder.svg", // Replace with actual image path
                    },
                  ].map((article) => (
                    <Link href={article.href} key={article.title}>
                      <div
                        className={`bg-gray-900/50 border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl cursor-pointer h-full ${
                          viewMode === "compact" ? "flex items-center" : "flex flex-col"
                        }`}
                      >
                        <div className={viewMode === "compact" ? "flex-shrink-0 w-32 h-20" : ""}>
                          <Image
                            src={article.image}
                            alt={article.title}
                            width={viewMode === "grid" ? 300 : 128}
                            height={viewMode === "grid" ? 170 : 80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="p-3 flex flex-col flex-grow">
                          <h3 className="text-base font-semibold text-white mb-1">{article.title}</h3>
                          <p className="text-xs text-gray-400 flex-grow">{article.description}</p>
                          <button className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 self-start">Learn More</button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "discover" && (
              <div>
                {/* Content for Discover tab */}
              </div>
            )}
            {activeTab === "bestiary" && (
              <div>
                {/* Content for Bestiary tab */}
              </div>
            )}
            {activeTab === "armory" && (
              <div>
                {/* Content for Armory tab */}
              </div>
            )}
            {activeTab === "infirmary" && (
              <div>
                {/* Content for Infirmary tab */}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
 );
}

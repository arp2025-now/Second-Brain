import { Search, Bell, Menu } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuClick?: () => void;
  title?: string;
}

export function Header({
  searchQuery,
  onSearchChange,
  onMenuClick,
  title = 'Dashboard',
}: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div
          className={`
            relative flex items-center transition-all duration-200
            ${isSearchFocused ? 'w-full sm:w-80 absolute sm:relative left-0 right-0 px-3 sm:px-0 bg-white sm:bg-transparent z-10' : 'w-10 sm:w-64'}
          `}
        >
          <Search className={`w-5 h-5 text-gray-400 ${isSearchFocused ? 'absolute left-6 sm:left-3' : 'sm:absolute sm:left-3'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search items..."
            className={`
              w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border border-transparent
              focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors
              ${isSearchFocused ? 'block' : 'hidden sm:block'}
            `}
          />
          {/* Mobile search icon button */}
          <button
            onClick={() => setIsSearchFocused(true)}
            className={`sm:hidden p-2 hover:bg-gray-100 rounded-lg ${isSearchFocused ? 'hidden' : 'block'}`}
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          {searchQuery && !isSearchFocused && (
            <kbd className="absolute right-3 px-2 py-0.5 text-xs bg-gray-200 text-gray-500 rounded hidden sm:block">
              ESC
            </kbd>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}

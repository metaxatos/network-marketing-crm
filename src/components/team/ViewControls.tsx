'use client';

import { TeamView, TeamFilters } from '@/types/team';
import { Search, Grid, List, Filter, X } from 'lucide-react';

interface ViewControlsProps {
  view: TeamView;
  onViewChange: (view: TeamView) => void;
  onSearch: (searchTerm: string) => void;
  onFilter: (key: keyof TeamFilters, value: string) => void;
  filters: TeamFilters;
}

export const ViewControls = ({ 
  view, 
  onViewChange, 
  onSearch, 
  onFilter, 
  filters 
}: ViewControlsProps) => {
  return (
    <>
      {/* Mobile View Toggle - Floating */}
      <div className="md:hidden fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white shadow-lg rounded-full p-1 border border-white/50">
          <div className="flex">
            <button
              onClick={() => onViewChange('tree')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                view === 'tree' 
                  ? 'bg-action-purple text-white shadow-purple' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Grid className="w-4 h-4" />
              Tree
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                view === 'list' 
                  ? 'bg-action-purple text-white shadow-purple' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header Bar */}
      <div className="hidden md:block bg-white rounded-2xl p-6 shadow-md border border-white/50 mb-8">
        <div className="flex items-center justify-between gap-6">
          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <div className="bg-gray-50 rounded-xl p-1 flex">
              <button
                onClick={() => onViewChange('tree')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  view === 'tree' 
                    ? 'bg-white text-action-purple shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Grid className="w-4 h-4" />
                Tree View
              </button>
              <button
                onClick={() => onViewChange('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  view === 'list' 
                    ? 'bg-white text-action-purple shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <List className="w-4 h-4" />
                List View
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
              <input
                type="text"
                placeholder="Search team members..."
                defaultValue={filters.searchTerm || ''}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-action-purple focus:ring-2 focus:ring-purple-100 transition-all duration-300 text-base placeholder-text-light"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <Filter className="w-4 h-4" />
              Filters:
            </div>
            
            <select 
              value={filters.status || ''}
              onChange={(e) => onFilter('status', e.target.value)}
              className="px-4 py-2 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-action-purple focus:ring-2 focus:ring-purple-100 transition-all duration-300 text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select 
              value={filters.level || ''}
              onChange={(e) => onFilter('level', e.target.value)}
              className="px-4 py-2 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-action-purple focus:ring-2 focus:ring-purple-100 transition-all duration-300 text-sm"
            >
              <option value="">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3+</option>
            </select>
            
            {/* Clear filters button */}
            {(filters.searchTerm || filters.status || filters.level) && (
              <button
                onClick={() => {
                  onSearch('');
                  onFilter('status', '');
                  onFilter('level', '');
                }}
                className="flex items-center gap-2 px-4 py-2 text-text-light hover:text-text-secondary transition-colors duration-300 bg-gray-50 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
          <input
            type="text"
            placeholder="Search team members..."
            defaultValue={filters.searchTerm || ''}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl shadow-md focus:border-action-purple focus:ring-2 focus:ring-purple-100 transition-all duration-300 text-base placeholder-text-light"
          />
        </div>
        
        {/* Mobile Filters */}
        {(filters.searchTerm || filters.status || filters.level) && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {filters.searchTerm && (
              <div className="flex items-center gap-2 bg-action-purple bg-opacity-10 text-action-purple px-3 py-1 rounded-full text-sm whitespace-nowrap">
                "{filters.searchTerm}"
                <button onClick={() => onSearch('')}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.status && (
              <div className="flex items-center gap-2 bg-action-teal bg-opacity-10 text-action-teal px-3 py-1 rounded-full text-sm whitespace-nowrap">
                Status: {filters.status}
                <button onClick={() => onFilter('status', '')}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.level && (
              <div className="flex items-center gap-2 bg-action-golden bg-opacity-10 text-action-golden px-3 py-1 rounded-full text-sm whitespace-nowrap">
                Level: {filters.level}
                <button onClick={() => onFilter('level', '')}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}; 

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatus, LeadStatusLabels } from '@/types/lead';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentStatus: LeadStatus | 'all';
  onStatusChange: (status: LeadStatus | 'all') => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  currentStatus,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 w-full">
      <Input
        placeholder="Pesquisar leads..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-grow"
      />
      <Select 
        value={currentStatus} 
        onValueChange={(value) => onStatusChange(value as LeadStatus | 'all')}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {(Object.keys(LeadStatusLabels) as LeadStatus[]).map((status) => (
            <SelectItem key={status} value={status}>
              {LeadStatusLabels[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchBar;

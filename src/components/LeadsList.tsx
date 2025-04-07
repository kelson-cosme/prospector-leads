
import React from 'react';
import LeadCard from './LeadCard';
import { Lead, LeadStatus } from '@/types/lead';

interface LeadsListProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  onEditLead,
  onDeleteLead,
  onStatusChange,
}) => {
  if (leads.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum lead encontrado.</p>
        <p className="text-gray-500">Adicione novos leads para começar a prospectar!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onEdit={onEditLead}
          onDelete={onDeleteLead}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default LeadsList;

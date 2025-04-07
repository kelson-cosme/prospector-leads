
import React, { useState } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { Lead, LeadStatus } from '@/types/lead';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import LeadsList from '@/components/LeadsList';
import LeadFormModal from '@/components/LeadForm';
import DashboardSummary from '@/components/DashboardSummary';

const Index = () => {
  const {
    filteredLeads,
    leads,
    addLead,
    updateLead,
    deleteLead,
    searchLeads,
    filterByStatus,
    currentStatus,
    searchQuery,
  } = useLeads();

  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const handleOpenAddLead = () => {
    setEditingLead(null);
    setIsLeadFormOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsLeadFormOpen(true);
  };

  const handleLeadSubmit = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingLead) {
      updateLead(editingLead.id, leadData);
    } else {
      addLead(leadData);
    }
  };

  const handleStatusChange = (id: string, status: LeadStatus) => {
    updateLead(id, { status });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onOpenAddLeadModal={handleOpenAddLead} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard de Prospecção</h1>
          <p className="text-gray-600 mb-6">
            Gerencie seus leads potenciais para venda de landing pages e e-commerce.
          </p>
          
          <DashboardSummary leads={leads} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="mb-4">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={searchLeads}
              currentStatus={currentStatus}
              onStatusChange={filterByStatus}
            />
          </div>
          
          <LeadsList
            leads={filteredLeads}
            onEditLead={handleEditLead}
            onDeleteLead={deleteLead}
            onStatusChange={handleStatusChange}
          />
        </div>
      </main>

      <LeadFormModal
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        onSubmit={handleLeadSubmit}
        editingLead={editingLead}
      />
      
      <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
        <p>Site Seeker - Ferramenta de Prospecção para Desenvolvedores Web</p>
      </footer>
    </div>
  );
};

export default Index;

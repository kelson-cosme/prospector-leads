
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, LeadStatus } from '../types/lead';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

interface LeadContextType {
  leads: Lead[];
  filteredLeads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  searchLeads: (query: string) => void;
  filterByStatus: (status: LeadStatus | 'all') => void;
  currentStatus: LeadStatus | 'all';
  searchQuery: string;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>(() => {
    const savedLeads = localStorage.getItem('leads');
    if (savedLeads) {
      try {
        const parsedLeads = JSON.parse(savedLeads);
        return parsedLeads.map((lead: any) => ({
          ...lead,
          createdAt: new Date(lead.createdAt),
          updatedAt: new Date(lead.updatedAt)
        }));
      } catch (error) {
        console.error('Error parsing leads from localStorage:', error);
        return [];
      }
    }
    return [];
  });
  
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(leads);
  const [currentStatus, setCurrentStatus] = useState<LeadStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
    applyFilters(searchQuery, currentStatus);
  }, [leads]);

  const applyFilters = (query: string, status: LeadStatus | 'all') => {
    let filtered = [...leads];

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.businessName.toLowerCase().includes(lowerQuery) ||
          lead.contactName.toLowerCase().includes(lowerQuery) ||
          lead.email.toLowerCase().includes(lowerQuery) ||
          lead.phone.toLowerCase().includes(lowerQuery) ||
          lead.industry.toLowerCase().includes(lowerQuery)
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((lead) => lead.status === status);
    }

    setFilteredLeads(filtered);
  };

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newLead: Lead = {
      ...lead,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    setLeads((prevLeads) => [...prevLeads, newLead]);
    toast({
      title: "Lead adicionado",
      description: `${lead.businessName} foi adicionado com sucesso`,
    });
  };

  const updateLead = (id: string, updatedFields: Partial<Lead>) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id
          ? { ...lead, ...updatedFields, updatedAt: new Date() }
          : lead
      )
    );
    toast({
      title: "Lead atualizado",
      description: "As informações foram atualizadas com sucesso",
    });
  };

  const deleteLead = (id: string) => {
    const leadToDelete = leads.find(lead => lead.id === id);
    setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== id));
    toast({
      title: "Lead removido",
      description: leadToDelete ? `${leadToDelete.businessName} foi removido` : "Lead foi removido",
      variant: "destructive",
    });
  };

  const searchLeads = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, currentStatus);
  };

  const filterByStatus = (status: LeadStatus | 'all') => {
    setCurrentStatus(status);
    applyFilters(searchQuery, status);
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        filteredLeads,
        addLead,
        updateLead,
        deleteLead,
        searchLeads,
        filterByStatus,
        currentStatus,
        searchQuery
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};

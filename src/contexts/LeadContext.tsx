
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, LeadStatus } from '../types/lead';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { leadsCollection } from '@/services/firebase';
import { addDoc, doc, deleteDoc, updateDoc, collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

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
const db = getFirestore();

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

  // Carregar leads do Firebase ao iniciar
  useEffect(() => {
    const loadLeadsFromFirebase = async () => {
      try {
        console.log('Loading leads from Firebase...');
        const q = query(leadsCollection);
        const querySnapshot = await getDocs(q);
        
        const firebaseLeads: Lead[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          firebaseLeads.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
          } as Lead);
        });
        
        console.log('Loaded leads from Firebase:', firebaseLeads.length);
        if (firebaseLeads.length > 0) {
          setLeads(firebaseLeads);
        }
      } catch (error) {
        console.error('Error loading leads from Firebase:', error);
      }
    };
    
    loadLeadsFromFirebase();
  }, []);

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

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newLead: Lead = {
      ...lead,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    // Check if lead with same business name and address already exists
    const duplicateLead = leads.find(
      l => l.businessName === lead.businessName && l.address === lead.address
    );
    
    if (duplicateLead) {
      toast({
        title: "Lead duplicado",
        description: `${lead.businessName} já existe no seu banco de dados`,
        variant: "destructive"
      });
      return;
    }
    
    // Add to state and localStorage
    setLeads((prevLeads) => [...prevLeads, newLead]);
    
    // Also save to Firebase
    try {
      console.log('Adding lead to Firebase:', newLead);
      const docRef = await addDoc(leadsCollection, {
        ...newLead,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      });
      console.log('Lead added to Firebase with ID:', docRef.id);
    } catch (error) {
      console.error("Error adding lead to Firebase:", error);
    }
    
    toast({
      title: "Lead adicionado",
      description: `${lead.businessName} foi adicionado com sucesso`,
    });
  };

  const updateLead = async (id: string, updatedFields: Partial<Lead>) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id
          ? { ...lead, ...updatedFields, updatedAt: new Date() }
          : lead
      )
    );
    
    // Also update in Firebase
    try {
      console.log('Updating lead in Firebase:', { id, ...updatedFields });
      const leadRef = doc(db, "leads", id);
      await updateDoc(leadRef, {
        ...updatedFields,
        updatedAt: new Date().toISOString()
      });
      console.log('Lead updated in Firebase successfully');
    } catch (error) {
      console.error("Error updating lead in Firebase:", error);
    }
    
    toast({
      title: "Lead atualizado",
      description: "As informações foram atualizadas com sucesso",
    });
  };

  const deleteLead = async (id: string) => {
    const leadToDelete = leads.find(lead => lead.id === id);
    setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== id));
    
    // Also delete from Firebase
    try {
      console.log('Deleting lead from Firebase:', id);
      const leadRef = doc(db, "leads", id);
      await deleteDoc(leadRef);
      console.log('Lead deleted from Firebase successfully');
    } catch (error) {
      console.error("Error deleting lead from Firebase:", error);
    }
    
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

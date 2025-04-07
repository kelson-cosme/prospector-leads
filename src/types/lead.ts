
export interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  industry: string;
  notes: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'proposal' | 'closed' | 'lost';

export const LeadStatusLabels: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  interested: 'Interessado',
  proposal: 'Proposta',
  closed: 'Fechado',
  lost: 'Perdido'
};

export const LeadStatusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-purple-100 text-purple-800',
  interested: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-orange-100 text-orange-800',
  closed: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800'
};

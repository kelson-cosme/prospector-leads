import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead, LeadStatus, LeadStatusLabels } from '@/types/lead';
import { LucidePhone, LucideMail, LucideEdit, LucideTrash, LucideCheck, LucideMessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

const statusBadgeColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  contacted: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  interested: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  proposal: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  closed: 'bg-green-100 text-green-800 hover:bg-green-200',
  lost: 'bg-red-100 text-red-800 hover:bg-red-200',
  has_website: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
};

const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, onDelete, onStatusChange }) => {
  // Extract website URL from notes if it exists
  const websiteMatch = lead.notes.match(/Website: (https?:\/\/[^\s]+)/);
  const website = websiteMatch ? websiteMatch[1] : null;

  // Extract place_id from notes if it exists
  const placeIdMatch = lead.notes.match(/place_id: ([a-zA-Z0-9_-]+)/);
  const placeId = placeIdMatch ? placeIdMatch[1] : null;

  const handleWhatsAppClick = () => {
    // Remove todos os caracteres não numéricos
    let phoneNumber = lead.phone.replace(/\D/g, '');

    // Verifica se o número já tem o código do país (55) e tem o tamanho correto
    // Um número brasileiro completo com código do país tem 12 (fixo) ou 13 (celular) dígitos
    if (phoneNumber.length <= 11) {
      phoneNumber = `55${phoneNumber}`;
    }
    
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
          <h3 className="text-lg font-bold">{lead.businessName}</h3>
          <Badge className={cn("mt-2 md:mt-0", statusBadgeColors[lead.status])}>
            {LeadStatusLabels[lead.status]}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">Contato: {lead.contactName}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <LucidePhone size={14} />
            <span>{lead.phone || "Não informado"}</span>
          </div>
          {/* <div className="flex items-center space-x-2 text-sm text-gray-600">
            <LucideMail size={14} />
            <span>{lead.email || "Não informado"}</span>
          </div> */}
          {lead.industry && (
            <p className="text-sm text-gray-600">Indústria: {lead.industry}</p>
          )}
          {website && (
            <p className="text-sm text-gray-600">
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Site: {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </p>
          )}
        </div>

        {lead.notes && (
          <div className="mb-4">
            <p className="text-sm italic text-gray-600">
              {lead.notes.replace(/place_id: [a-zA-Z0-9_-]+/, '')}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between mt-2">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => onEdit(lead)}
            >
              <LucideEdit size={14} />
              <span>Editar</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
              onClick={() => onDelete(lead.id)}
            >
              <LucideTrash size={14} />
              <span>Excluir</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={handleWhatsAppClick}
            >
              <LucideMessageSquare size={14} />
              <span>WhatsApp</span>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center gap-1 mt-2 md:mt-0">
                <LucideCheck size={14} />
                <span>Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(LeadStatusLabels) as LeadStatus[]).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onStatusChange(lead.id, status)}
                  className={cn(
                    lead.status === status && "font-bold",
                    "cursor-pointer"
                  )}
                >
                  {LeadStatusLabels[status]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
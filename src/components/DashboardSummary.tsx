import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead, LeadStatus, LeadStatusLabels } from '@/types/lead';
import { LucideBookOpen, LucidePhone, LucideThumbsUp, LucideFileSpreadsheet, LucideCheckCircle, LucideXCircle, LucideGlobe } from 'lucide-react';

interface DashboardSummaryProps {
  leads: Lead[];
}

const statusIcons: Record<LeadStatus, React.ReactNode> = {
  new: <LucideBookOpen className="h-5 w-5 text-blue-500" />,
  contacted: <LucidePhone className="h-5 w-5 text-purple-500" />,
  interested: <LucideThumbsUp className="h-5 w-5 text-yellow-500" />,
  proposal: <LucideFileSpreadsheet className="h-5 w-5 text-orange-500" />,
  closed: <LucideCheckCircle className="h-5 w-5 text-green-500" />,
  lost: <LucideXCircle className="h-5 w-5 text-red-500" />,
  has_website: <LucideGlobe className="h-5 w-5 text-emerald-500" />,
};

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ leads }) => {
  const getStatusCount = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status).length;
  };

  const totalLeads = leads.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {(Object.keys(LeadStatusLabels) as LeadStatus[]).map((status) => (
        <Card key={status}>
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle className="text-sm font-medium">
              {LeadStatusLabels[status]}
            </CardTitle>
            {statusIcons[status]}
          </CardHeader>
          <CardContent className="py-0 pb-2">
            <div className="text-2xl font-bold">{getStatusCount(status)}</div>
            <p className="text-xs text-muted-foreground">
              {totalLeads > 0
                ? `${Math.round((getStatusCount(status) / totalLeads) * 100)}% do total`
                : '0% do total'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardSummary;

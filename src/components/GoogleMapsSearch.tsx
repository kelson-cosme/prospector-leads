
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead, LeadStatus } from '@/types/lead';
import { useToast } from '@/hooks/use-toast';
import { useLeads } from '@/contexts/LeadContext';

interface GoogleMapsSearchProps {
  onLeadFound: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const GoogleMapsSearch: React.FC<GoogleMapsSearchProps> = ({ onLeadFound }) => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { addLead } = useLeads();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword || !location) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, informe uma palavra-chave e localização",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    
    // Simulando a busca no Google Maps (em uma aplicação real, usaríamos a API do Google Maps Places)
    try {
      toast({
        title: "Importante",
        description: "Para buscar leads no Google Maps, é necessário implementar a integração com a API do Google Maps Places. Esta é uma funcionalidade que requer uma chave de API do Google Cloud.",
      });
      
      // Simulando resultados de exemplo após um pequeno delay
      setTimeout(() => {
        const mockResults = [
          {
            businessName: `Loja ${keyword} 1`,
            contactName: 'Proprietário',
            phone: '(11) 9999-8888',
            email: `contato@${keyword.toLowerCase()}1.com.br`,
            address: `Rua Principal, 123 - ${location}`,
            industry: keyword,
            notes: 'Lead encontrado via Google Maps',
            status: 'new' as LeadStatus
          },
          {
            businessName: `Comercial ${keyword} 2`,
            contactName: 'Gerente',
            phone: '(11) 7777-6666',
            email: `vendas@${keyword.toLowerCase()}2.com.br`,
            address: `Avenida Central, 456 - ${location}`,
            industry: keyword,
            notes: 'Lead encontrado via Google Maps',
            status: 'new' as LeadStatus
          }
        ];
        
        // Adiciona os leads encontrados
        mockResults.forEach(lead => {
          addLead(lead);
        });
        
        toast({
          title: "Busca concluída",
          description: `Foram encontrados ${mockResults.length} leads para "${keyword}" em "${location}"`
        });
        
        setIsSearching(false);
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar leads no Google Maps",
        variant: "destructive"
      });
      setIsSearching(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Buscar Leads no Google Maps</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">Palavra-chave (tipo de negócio) *</Label>
              <Input
                id="keyword"
                placeholder="Ex: loja de roupas, padaria, salão de beleza"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isSearching}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                placeholder="Ex: Bairro, Cidade ou CEP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSearching}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-brand-600 hover:bg-brand-700"
            disabled={isSearching}
          >
            {isSearching ? "Buscando..." : "Buscar no Google Maps"}
          </Button>
          
          <p className="text-sm text-gray-500 mt-2">
            * Esta funcionalidade simula a busca de leads no Google Maps. Para uma implementação real, é necessário integrar com a API do Google Maps Places e obter uma chave de API do Google Cloud.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsSearch;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead, LeadStatus } from '@/types/lead';
import { useToast } from '@/hooks/use-toast';
import { useLeads } from '@/contexts/LeadContext';
import { GooglePlace } from '@/types/googlePlace';
import { saveSearchResults, getPreviousSearchResults, checkLeadExists } from '@/services/firebase';
import { Loader } from 'lucide-react';

interface GoogleMapsSearchProps {
  onLeadFound: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const GoogleMapsSearch: React.FC<GoogleMapsSearchProps> = ({ onLeadFound }) => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [apiKey] = useState(import.meta.env.VITE_API_KEY);
  const [corsProxyUrl, setCorsProxyUrl] = useState('https://corsproxy.io/?');
  const [showCorsWarning, setShowCorsWarning] = useState(false);
  const [previouslyAddedResults, setPreviouslyAddedResults] = useState<string[]>([]);
  const { toast } = useToast();
  const { addLead, leads } = useLeads();

  useEffect(() => {
    console.log('GoogleMapsSearch component initialized');
    console.log('Using API key from .env file');
    
    if (!apiKey) {
      console.error('API key is not defined in .env file');
      toast({
        title: "Erro de configuração",
        description: "A chave da API do Google Maps não está definida no arquivo .env",
        variant: "destructive"
      });
    }
  }, [apiKey, toast]);

  useEffect(() => {
    const placeIds = leads.map(lead => {
      const placeIdMatch = lead.notes.match(/place_id: ([a-zA-Z0-9_-]+)/);
      return placeIdMatch ? placeIdMatch[1] : '';
    }).filter(id => id);
    
    console.log('Previously added place IDs:', placeIds.length);
    setPreviouslyAddedResults(placeIds);
  }, [leads]);

  const searchGooglePlaces = async (keyword: string, location: string, getNewResults = false) => {
    console.log('Starting search with params:', { keyword, location, getNewResults });
    console.log('Using API key:', apiKey ? 'API key is set' : 'API key is missing');
    
    // Try to get previous results first unless specifically requesting new results
    if (!getNewResults) {
      try {
        console.log('Attempting to get previous results');
        const previousResults = await getPreviousSearchResults(keyword, location);
        console.log('Previous results:', previousResults);
        
        if (previousResults.length > 0) {
          const notAddedResults = previousResults.filter(place => 
            !previouslyAddedResults.includes(place.place_id)
          );
          
          console.log('Not added results:', notAddedResults.length);
          
          if (notAddedResults.length > 0) {
            toast({
              title: "Resultados anteriores",
              description: `Mostrando ${notAddedResults.length} resultados diferentes de buscas anteriores.`
            });
            
            return notAddedResults.slice(0, 5);
          }
        }
      } catch (error) {
        console.error('Erro ao obter resultados anteriores:', error);
        // Continue with new search even if getting previous results fails
      }
    }
    
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(keyword)}+in+${encodeURIComponent(location)}&key=${apiKey}`;
    const proxyUrl = `${corsProxyUrl}${encodeURIComponent(googleApiUrl)}`;
    
    console.log('Fetching from Google API via proxy:', proxyUrl);
    
    try {
      const response = await fetch(proxyUrl);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.log("Resposta da API (error):", text);
        
        if (text.includes("See /corsdemo")) {
          setShowCorsWarning(true);
          throw new Error("Erro no proxy CORS. É necessário ativar o serviço de proxy.");
        }
        
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.status === 'OK') {
        const filteredResults = data.results.filter((place: any) => {
          return place.formatted_address.toLowerCase().includes(location.toLowerCase());
        });
        
        console.log('Filtered results count:', filteredResults.length);
        
        if (filteredResults.length === 0) {
          toast({
            title: "Atenção",
            description: `Não foram encontrados resultados específicos para "${location}". Verifique a localização ou tente uma busca mais ampla.`,
            variant: "destructive"
          });
          
          if (data.results.length > 0) {
            toast({
              title: "Resultados alternativos",
              description: `Mostrando resultados que podem não estar em "${location}".`,
              variant: "default"
            });
          }
        }
        
        const placesToProcess = filteredResults.length > 0 ? filteredResults : data.results;
        console.log('Places to process:', placesToProcess.length);
        
        const newPlacesToProcess = placesToProcess.filter((place: any) => 
          !previouslyAddedResults.includes(place.place_id)
        ).slice(0, 5);
        
        console.log('New places to process:', newPlacesToProcess.length);
        
        if (newPlacesToProcess.length === 0) {
          if (getNewResults) {
            throw new Error("Todos os resultados já foram adicionados anteriormente.");
          }
          
          toast({
            title: "Sem novos resultados",
            description: "Todos os resultados já foram adicionados anteriormente. Tentando uma busca mais ampla.",
            variant: "destructive"
          });
          
          return searchGooglePlaces(keyword, "", true);
        }
        
        const placeResults: GooglePlace[] = [];
        
        for (const place of newPlacesToProcess) {
          try {
            console.log(`Fetching details for place: ${place.name}`);
            const detailsApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,geometry&key=${apiKey}`;
            const detailsProxyUrl = `${corsProxyUrl}${encodeURIComponent(detailsApiUrl)}`;
            
            console.log(`Details API URL via proxy: ${detailsProxyUrl}`);
            
            const detailsResponse = await fetch(detailsProxyUrl);
            
            if (!detailsResponse.ok) {
              console.error('Erro ao buscar detalhes:', detailsResponse.status, detailsResponse.statusText);
              continue;
            }
            
            const detailsData = await detailsResponse.json();
            console.log('Details data for place:', place.name, detailsData);
            
            if (detailsData.status === 'OK') {
              placeResults.push({
                ...detailsData.result,
                place_id: place.place_id,
                types: place.types || [],
                geometry: detailsData.result.geometry
              });
            }
          } catch (error) {
            console.error('Erro ao buscar detalhes do lugar:', error);
          }
        }
        
        console.log('Final place results count:', placeResults.length);
        
        // Only save results to Firebase if we have any
        if (placeResults.length > 0) {
          try {
            console.log('Saving search results to Firebase');
            await saveSearchResults(keyword, location, placeResults);
            console.log('Search results saved successfully');
          } catch (error) {
            console.error('Erro ao salvar resultados no Firebase:', error);
          }
        }
        
        return placeResults;
      } else {
        console.error('API Error:', data.status, data.error_message);
        throw new Error(`Erro na API Google Maps: ${data.status} - ${data.error_message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      throw error;
    }
  };

  const extractDomainFromWebsite = (website?: string): string => {
    if (!website) return '';
    
    try {
      const url = new URL(website);
      return url.hostname.replace('www.', '');
    } catch (e) {
      return '';
    }
  };

  const generateEmail = (place: GooglePlace): string => {
    const domain = extractDomainFromWebsite(place.website);
    if (domain) {
      return `contato@${domain}`;
    }
    
    const cityMatch = place.formatted_address.match(/([^,]+),/);
    const city = cityMatch ? cityMatch[1].trim().toLowerCase().replace(/\s+/g, '') : '';
    
    const businessNameSlug = place.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .replace(/\s+/g, '');      // Remove spaces
      
    return `contato@${businessNameSlug}${city ? '.' + city : ''}.com.br`;
  };

  const convertPlaceToLead = (place: GooglePlace): Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> => {
    const initialStatus: LeadStatus = place.website ? 'has_website' : 'new';
    
    return {
      businessName: place.name,
      contactName: 'Contato não disponível',
      phone: place.formatted_phone_number || 'Não disponível',
      email: generateEmail(place),
      address: place.formatted_address,
      industry: place.types?.[0] || keyword,
      notes: `Lead encontrado via Google Maps. Website: ${place.website || 'Não disponível'}. place_id: ${place.place_id}`,
      status: initialStatus
    };
  };

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
    
    if (!apiKey) {
      toast({
        title: "API Key não encontrada",
        description: "A chave da API do Google Maps não está definida no arquivo .env",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    setShowCorsWarning(false);
    
    try {
      console.log('Starting search for:', keyword, 'in', location);
      const places = await searchGooglePlaces(keyword, location);
      
      if (!places) {
        console.log('No places returned from search');
        toast({
          title: "Erro na busca",
          description: "Não foi possível obter resultados. Verifique o console para mais detalhes.",
          variant: "destructive"
        });
        setIsSearching(false);
        return;
      }
      
      console.log('Search completed, places found:', places.length);
      
      if (places && places.length > 0) {
        let addedCount = 0;
        
        for (const place of places) {
          try {
            console.log('Checking if lead exists:', place.name);
            const leadExists = await checkLeadExists(place.name, place.formatted_address);
            
            if (!leadExists) {
              console.log('Adding new lead:', place.name);
              const lead = convertPlaceToLead(place);
              addLead(lead);
              addedCount++;
              
              setPreviouslyAddedResults(prev => [...prev, place.place_id]);
            } else {
              console.log('Lead already exists:', place.name);
            }
          } catch (error) {
            console.error('Error processing place:', place, error);
          }
        }
        
        toast({
          title: "Busca concluída",
          description: `Foram adicionados ${addedCount} novos leads para "${keyword}" em "${location}"`
        });
      } else {
        toast({
          title: "Nenhum resultado",
          description: `Não foram encontrados resultados para "${keyword}" em "${location}"`,
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Search error details:', errorMessage);
      
      if (errorMessage.includes("CORS") || errorMessage.includes("proxy")) {
        toast({
          title: "Erro de CORS",
          description: "O proxy CORS está bloqueando a requisição. Tente usar outro proxy ou uma solução de servidor.",
          variant: "destructive"
        });
        setShowCorsWarning(true);
      } else if (errorMessage.includes("já foram adicionados")) {
        toast({
          title: "Sem novos resultados",
          description: "Todos os resultados já foram adicionados anteriormente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro na busca",
          description: `Erro: ${errorMessage}`,
          variant: "destructive"
        });
      }
    } finally {
      // Always reset isSearching to false, even if an error occurred
      console.log('Search process completed, resetting isSearching');
      setIsSearching(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Buscar Leads no Google Maps</CardTitle>
      </CardHeader>
      <CardContent>
        {showCorsWarning && (
          <div className="mb-4 p-4 border border-yellow-300 rounded-md bg-yellow-50">
            <h3 className="font-semibold text-yellow-800">Aviso sobre CORS</h3>
            <p className="text-sm text-yellow-700 mb-2">
              Estamos enfrentando problemas com o proxy CORS. O serviço cors-anywhere.herokuapp.com requer autorização prévia.
            </p>
            <p className="text-sm text-yellow-700 mb-2">
              Soluções possíveis:
            </p>
            <ol className="list-decimal list-inside text-sm text-yellow-700 mb-2 space-y-1">
              <li>Visite <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://cors-anywhere.herokuapp.com/corsdemo</a> e clique em "Request temporary access to the demo server"</li>
              <li>Ou use outro serviço de proxy CORS (corsproxy.io já está configurado por padrão)</li>
              <li>Idealmente, implemente um proxy no seu próprio servidor backend</li>
            </ol>
            <div className="space-y-2 mt-2">
              <Label htmlFor="corsProxy">URL do Proxy CORS</Label>
              <Input
                id="corsProxy"
                placeholder="URL do proxy CORS (ex: https://corsproxy.io/?)"
                value={corsProxyUrl}
                onChange={(e) => setCorsProxyUrl(e.target.value)}
              />
            </div>
          </div>
        )}
        
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
            {isSearching ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Buscando...
              </span>
            ) : (
              "Buscar no Google Maps"
            )}
          </Button>
          
          <p className="text-sm text-gray-500 mt-2">
            * A busca faz uso da API do Google Maps Places e pode estar sujeita a limitações e custos de acordo com seu plano do Google Cloud.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsSearch;

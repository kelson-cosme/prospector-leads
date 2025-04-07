
import React, { useState, useEffect } from 'react';
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

interface GooglePlace {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  place_id: string;
  types: string[];
<<<<<<< HEAD
=======
  geometry?: {
    location: {
      lat: number;
      lng: number;
    }
  };
>>>>>>> 4b2037724eb1b453e7eef4868d7582b60981d271
}

const GoogleMapsSearch: React.FC<GoogleMapsSearchProps> = ({ onLeadFound }) => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
<<<<<<< HEAD
=======
  const [corsProxyUrl, setCorsProxyUrl] = useState('https://corsproxy.io/?');
  const [showCorsWarning, setShowCorsWarning] = useState(false);
>>>>>>> 4b2037724eb1b453e7eef4868d7582b60981d271
  const { toast } = useToast();
  const { addLead } = useLeads();

  useEffect(() => {
    // Verificar se já existe uma API key salva no localStorage
    const savedApiKey = localStorage.getItem('googleMapsApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('googleMapsApiKey', apiKey);
      setShowApiKeyInput(false);
      toast({
        title: "API Key salva",
        description: "Sua chave da API do Google Maps foi salva localmente"
      });
    } else {
      toast({
        title: "Chave inválida",
        description: "Por favor, informe uma chave de API válida",
        variant: "destructive"
      });
    }
  };

  const searchGooglePlaces = async (keyword: string, location: string) => {
    // Construindo a URL para a API Nearby Search do Google Maps Places
<<<<<<< HEAD
    const url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&key=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        // Processando os resultados
        const places = data.results;
        const placeResults: GooglePlace[] = [];
        
        // Para cada lugar, buscar detalhes adicionais
        for (const place of places.slice(0, 5)) { // Limitando a 5 resultados para evitar muitas requisições
          try {
            const detailsUrl = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website&key=${apiKey}`;
            const detailsResponse = await fetch(detailsUrl);
=======
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(keyword)}+in+${encodeURIComponent(location)}&key=${apiKey}`;
    const proxyUrl = `${corsProxyUrl}${encodeURIComponent(googleApiUrl)}`;
    
    try {
      const response = await fetch(proxyUrl);
      
      // Verificar se a resposta é válida antes de tentar processar como JSON
      if (!response.ok) {
        const text = await response.text();
        console.log("Resposta da API:", text);
        
        if (text.includes("See /corsdemo")) {
          setShowCorsWarning(true);
          throw new Error("Erro no proxy CORS. É necessário ativar o serviço de proxy.");
        }
        
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        // Verificar se os resultados contêm a localização especificada
        const filteredResults = data.results.filter((place: any) => {
          // Verificar se o endereço formatado contém a localização especificada
          return place.formatted_address.toLowerCase().includes(location.toLowerCase());
        });
        
        if (filteredResults.length === 0) {
          toast({
            title: "Atenção",
            description: `Não foram encontrados resultados específicos para "${location}". Verifique a localização ou tente uma busca mais ampla.`,
            variant: "destructive"
          });
          
          // Se não houver resultados filtrados, use alguns dos resultados originais com uma advertência
          if (data.results.length > 0) {
            toast({
              title: "Resultados alternativos",
              description: `Mostrando resultados que podem não estar em "${location}".`,
              variant: "default"
            });
          }
        }
        
        // Usar os resultados filtrados se houver, caso contrário, usar os resultados originais
        const placesToProcess = filteredResults.length > 0 ? filteredResults : data.results;
        const placeResults: GooglePlace[] = [];
        
        // Para cada lugar, buscar detalhes adicionais
        for (const place of placesToProcess.slice(0, 5)) {
          try {
            const detailsApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,geometry&key=${apiKey}`;
            const detailsProxyUrl = `${corsProxyUrl}${encodeURIComponent(detailsApiUrl)}`;
            
            const detailsResponse = await fetch(detailsProxyUrl);
            
            if (!detailsResponse.ok) {
              console.error('Erro ao buscar detalhes:', detailsResponse.status, detailsResponse.statusText);
              continue;
            }
            
>>>>>>> 4b2037724eb1b453e7eef4868d7582b60981d271
            const detailsData = await detailsResponse.json();
            
            if (detailsData.status === 'OK') {
              placeResults.push({
                ...detailsData.result,
                place_id: place.place_id,
<<<<<<< HEAD
                types: place.types
=======
                types: place.types || [],
                geometry: detailsData.result.geometry
>>>>>>> 4b2037724eb1b453e7eef4868d7582b60981d271
              });
            }
          } catch (error) {
            console.error('Erro ao buscar detalhes do lugar:', error);
          }
        }
        
        return placeResults;
      } else {
<<<<<<< HEAD
        throw new Error(`Erro na API: ${data.status}`);
=======
        throw new Error(`Erro na API Google Maps: ${data.status} - ${data.error_message || 'Erro desconhecido'}`);
>>>>>>> 4b2037724eb1b453e7eef4868d7582b60981d271
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      throw error;
    }
  };

<<<<<<< HEAD
=======
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
    // Estratégia 1: Usar o domínio do site se disponível
    const domain = extractDomainFromWebsite(place.website);
    if (domain) {
      return `contato@${domain}`;
    }
    
    // Estratégia 2: Criar um slug baseado no nome e na cidade
    const cityMatch = place.formatted_address.match(/([^,]+),/);
    const city = cityMatch ? cityMatch[1].trim().toLowerCase().replace(/\s+/g, '') : '';
    
    const businessNameSlug = place.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/gi, '') // Remove caracteres especiais
      .replace(/\s+/g, '');      // Remove espaços
      
    return `contato@${businessNameSlug}${city ? '.' + city : ''}.com.br`;
  };

>>>>>>> 4b2037724eb1b453e7eef4868d7582b60981d271
  const convertPlaceToLead = (place: GooglePlace): Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> => {
    return {
      businessName: place.name,
      contactName: 'Contato não disponível',
      phone: place.formatted_phone_number || 'Não disponível',
<<<<<<< HEAD
      email: `contato@${place.name.toLowerCase().replace(/\s+/g, '')}.exemplo`,
      address: place.formatted_address,
      industry: place.types[0] || keyword,
=======
      email: generateEmail(place),
      address: place.formatted_address,
      industry: place.types?.[0] || keyword,
>>>>>>> 4b2037724eb1b453e7eef4868d7582b60981d271
      notes: `Lead encontrado via Google Maps. Website: ${place.website || 'Não disponível'}`,
      status: 'new' as LeadStatus
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
        title: "API Key necessária",
        description: "Por favor, configure sua chave da API do Google Maps",
        variant: "destructive"
      });
      setShowApiKeyInput(true);
      return;
    }
    
    setIsSearching(true);
<<<<<<< HEAD
    
    try {
      // Na implementação real, você faria uma chamada para a API do Google Maps
      const places = await searchGooglePlaces(keyword, location);
      
      if (places.length > 0) {
=======
    setShowCorsWarning(false);
    
    try {
      const places = await searchGooglePlaces(keyword, location);
      
      if (places && places.length > 0) {
>>>>>>> 4b2037724eb1b453e7eef4868d7582b60981d271
        // Convertendo cada lugar em um lead e adicionando
        places.forEach(place => {
          const lead = convertPlaceToLead(place);
          addLead(lead);
        });
        
        toast({
          title: "Busca concluída",
          description: `Foram encontrados ${places.length} leads para "${keyword}" em "${location}"`
        });
      } else {
        toast({
          title: "Nenhum resultado",
          description: `Não foram encontrados resultados para "${keyword}" em "${location}"`,
          variant: "destructive"
        });
      }
    } catch (error) {
<<<<<<< HEAD
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar leads no Google Maps. Verifique sua chave de API.",
        variant: "destructive"
      });
=======
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes("CORS") || errorMessage.includes("proxy")) {
        toast({
          title: "Erro de CORS",
          description: "O proxy CORS está bloqueando a requisição. Tente usar outro proxy ou uma solução de servidor.",
          variant: "destructive"
        });
        setShowCorsWarning(true);
      } else {
        toast({
          title: "Erro na busca",
          description: `Erro: ${errorMessage}`,
          variant: "destructive"
        });
      }
>>>>>>> 4b2037724eb1b453e7eef4868d7582b60981d271
      console.error('Erro na busca de lugares:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Buscar Leads no Google Maps</CardTitle>
      </CardHeader>
      <CardContent>
        {showApiKeyInput ? (
          <div className="space-y-4 mb-4 p-4 border rounded-md bg-amber-50">
            <h3 className="font-semibold">Configurar API do Google Maps</h3>
            <p className="text-sm text-gray-600 mb-2">
              Para utilizar a busca no Google Maps, você precisa configurar uma chave de API do Google Cloud Platform com a API Places habilitada.
            </p>
            <div className="space-y-2">
              <Label htmlFor="apiKey">Google Maps API Key</Label>
              <Input
                id="apiKey"
                placeholder="Insira sua chave de API"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
              />
              <p className="text-xs text-gray-500">
                Sua chave será armazenada apenas no seu navegador. <a href="https://developers.google.com/maps/documentation/places/web-service/get-api-key" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Saiba como obter uma chave</a>
              </p>
              <Button onClick={saveApiKey} className="w-full">Salvar API Key</Button>
            </div>
          </div>
        ) : (
          <div className="mb-2 flex justify-between items-center">
            <p className="text-sm text-gray-600">API do Google Maps configurada</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowApiKeyInput(true)}
              className="text-xs"
            >
              Alterar API Key
            </Button>
          </div>
        )}
        
<<<<<<< HEAD
=======
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
        
>>>>>>> 4b2037724eb1b453e7eef4868d7582b60981d271
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
            disabled={isSearching || (!apiKey && !showApiKeyInput)}
          >
            {isSearching ? "Buscando..." : "Buscar no Google Maps"}
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

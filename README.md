# 📍 Buscar Leads no Google Maps

Ferramenta para prospecção automatizada de leads com base em pesquisas no Google Maps. Ideal para quem busca novos clientes ou oportunidades de negócio em regiões específicas.

## 🚀 Funcionalidades

- 🔎 **Busca por segmento e localização**  
  Utilize termos como `loja de roupas`, `mecânica`, `padaria`, etc., junto com um CEP ou cidade para encontrar empresas listadas no Google Maps.

- 🗂️ **Classificação de Leads por Status**  
  Organize os leads em diferentes estágios de negociação:
  - 🆕 `Novo`
  - 💬 `Interessado`
  - 📄 `Proposta`
  - ✅ `Fechado`
  - ❌ `Perdido`
  - 🤝 `Contratado`
  - 🌐 `Já tem site`

- 📋 **Coleta de Dados Automatizada**  
  Através da API do Google Maps, são extraídos dados como:
  - Nome da empresa
  - Endereço
  - Telefone
  - Website (se disponível)
  - Localização geográfica

- ☁️ **Armazenamento no Firebase**  
  Todos os leads coletados são salvos em tempo real no **Firebase Firestore**, permitindo acesso e gerenciamento dos dados em múltiplas sessões e dispositivos.

## 🛠️ Tecnologias Utilizadas

- Google Maps API
- Firebase Firestore
- (Adicione aqui: ex. Node.js, React, TypeScript, etc.)

## 💡 Casos de Uso

- Agências de marketing digital buscando clientes que ainda não têm site  
- Representantes comerciais em busca de novos parceiros  
- Consultores e prestadores de serviços com foco regional

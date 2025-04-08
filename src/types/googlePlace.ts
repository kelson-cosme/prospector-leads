
export interface GooglePlace {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  place_id: string;
  types: string[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    }
  };
}

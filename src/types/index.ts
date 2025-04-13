
export interface Client {
  id: string;
  civility: 'M' | 'Mme' | 'M et Mme';
  type: 'Particulier' | 'Professionnel';
  firstName: string;
  lastName: string;
  address: string;
  addressComplement?: string;
  zipCode: string;
  city: string;
  country: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string; // Client ID
  description?: string;
  notes?: string;
}

export interface QuoteItem {
  id: string;
  designation: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vat: number;
  totalHT: number;
  parentId?: string;
  level: number;
  position: number;
  details?: string;
  type?: 'Titre' | 'Sous-titre' | 'Texte' | 'Saut de page';
}

export interface Quote {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  client?: Client;
  clientId?: string;
  project?: Project;
  projectId?: string;
  items: QuoteItem[];
  paymentConditions: string;
  totalHT: number;
  totalTVA10: number;
  totalTVA20: number;
  totalTTC: number;
  footer?: string;
  description?: string;
}

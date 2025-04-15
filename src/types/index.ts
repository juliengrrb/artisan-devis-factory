export interface Client {
  id: string;
  type: 'Particulier' | 'Professionnel';
  civility: 'M' | 'Mme' | 'M et Mme';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  address?: string;
  addressComplement?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  address?: string;
  zipCode?: string;
  city?: string;
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
  level?: number;
  position?: number;
  type?: 'Titre' | 'Sous-titre' | 'Fourniture' | 'Main d\'oeuvre' | 'Ouvrage' | 'Texte' | 'Saut de page';
  details?: string;
}

export interface Quote {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  clientId?: string;
  projectId?: string;
  client?: Client;
  project?: Project;
  items: QuoteItem[];
  totalHT: number;
  totalTVA10: number;
  totalTVA20: number;
  totalTTC: number;
  paymentConditions: string;
  description?: string;
  footer?: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected';
  discount?: number;
  discountType?: '%' | '€ HT' | '€ TTC';
  discountAmount?: number;
  netTotalHT?: number;
}

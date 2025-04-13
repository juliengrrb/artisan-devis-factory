
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Client, Project, Quote, QuoteItem } from '@/types';

type AppContextType = {
  clients: Client[];
  projects: Project[];
  quotes: Quote[];
  currentQuote: Quote | null;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  createQuote: () => Quote;
  updateQuote: (quote: Quote) => void;
  deleteQuote: (id: string) => void;
  setCurrentQuote: (quote: Quote | null) => void;
  addQuoteItem: (item: Omit<QuoteItem, 'id'>) => void;
  updateQuoteItem: (item: QuoteItem) => void;
  deleteQuoteItem: (id: string) => void;
  getNextQuoteNumber: () => string;
};

// Données initiales pour les tests
const initialClients: Client[] = [
  {
    id: '1',
    civility: 'M',
    type: 'Particulier',
    firstName: 'Jean',
    lastName: 'Lefevre',
    address: '97 Rue de Rivoli',
    zipCode: '75001',
    city: 'Paris',
    country: 'France',
    email: 'lefevre@gmail.com',
    phone: '0123456754',
    notes: 'Maison et dépendance difficile d\'accès.'
  },
  {
    id: '2',
    civility: 'M',
    type: 'Particulier',
    firstName: 'Marc',
    lastName: 'Lefevre',
    address: '42 Avenue Montaigne',
    zipCode: '75008',
    city: 'Paris',
    country: 'France',
    email: 'marc.lefevre@gmail.com',
    phone: '0623457890'
  },
  {
    id: '3',
    civility: 'Mme',
    type: 'Particulier',
    firstName: 'Julie',
    lastName: 'Grosvalor',
    address: '8 Rue Saint-Honoré',
    zipCode: '75001',
    city: 'Paris',
    country: 'France',
    email: 'julie.g@email.com',
    phone: '0745123689'
  },
  {
    id: '4',
    civility: 'M',
    type: 'Particulier',
    firstName: 'Alexis',
    lastName: 'Jean-Noël',
    address: '15 Rue du Faubourg',
    zipCode: '75010',
    city: 'Paris',
    country: 'France',
    email: 'alexis.jn@email.com',
    phone: '0678452310'
  },
  {
    id: '5',
    civility: 'Mme',
    type: 'Particulier',
    firstName: 'Claire',
    lastName: 'Breton',
    address: '29 Rue de la Paix',
    zipCode: '75002',
    city: 'Paris',
    country: 'France',
    email: 'claire.b@email.com',
    phone: '0612345678'
  },
  {
    id: '6',
    civility: 'M',
    type: 'Particulier',
    firstName: 'Daniel',
    lastName: 'Arnaud',
    address: '76 Avenue des Champs-Élysées',
    zipCode: '75008',
    city: 'Paris',
    country: 'France',
    email: 'daniel.a@email.com',
    phone: '0756123498'
  },
  {
    id: '7',
    civility: 'M',
    type: 'Particulier',
    firstName: 'Julien',
    lastName: 'Leclerc',
    address: '5 Place Vendôme',
    zipCode: '75001',
    city: 'Paris',
    country: 'France',
    email: 'julien.l@email.com',
    phone: '0634567891'
  }
];

const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Rénovation du restaurant',
    client: '1',
    description: 'Rénovation du restaurant rue Rivoli (Salle du restaurant et à l\'étage)'
  }
];

const initialQuoteItems: QuoteItem[] = [
  {
    id: '1',
    designation: 'Salle du restaurant',
    quantity: 0,
    unit: '',
    unitPrice: 0,
    vat: 0,
    totalHT: 1237.22,
    level: 1,
    position: 0,
    type: 'Titre'
  },
  {
    id: '1.1',
    designation: 'Coin bar',
    quantity: 0,
    unit: '',
    unitPrice: 0,
    vat: 0,
    totalHT: 1237.22,
    parentId: '1',
    level: 2,
    position: 1,
    type: 'Sous-titre'
  },
  {
    id: '1.1.1',
    designation: 'Peinture du plafond et tâches associées',
    quantity: 23,
    unit: 'm²',
    unitPrice: 46,
    vat: 10,
    totalHT: 1058,
    parentId: '1.1',
    level: 3,
    position: 2,
    type: 'Fourniture'
  },
  {
    id: '1.1.2',
    designation: 'Cloisons de séparation',
    quantity: 8.75,
    unit: 'u',
    unitPrice: 11.34,
    vat: 20,
    totalHT: 99.22,
    parentId: '1.1',
    level: 3,
    position: 3,
    type: 'Fourniture',
    details: '- BA13 standard sur ossature métallique x 1 (m²)\n- Rail R90 et double montant M88 x 1 (m²)\n- Isolation GR80 x 1 (m²)'
  },
  {
    id: '1.1.3',
    designation: 'Enlèvement des déchets',
    quantity: 1,
    unit: 'u',
    unitPrice: 80,
    vat: 20,
    totalHT: 80,
    parentId: '1.1',
    level: 3,
    position: 4,
    type: 'Fourniture'
  },
  {
    id: '2',
    designation: 'Salle à l\'étage',
    quantity: 0,
    unit: '',
    unitPrice: 0,
    vat: 0,
    totalHT: 2182.50,
    level: 1,
    position: 5,
    type: 'Titre'
  },
  {
    id: '2.1',
    designation: 'Dépose de l\'ancienne moquette',
    quantity: 30,
    unit: 'm²',
    unitPrice: 10.75,
    vat: 20,
    totalHT: 322.50,
    parentId: '2',
    level: 2,
    position: 6,
    type: 'Fourniture'
  },
  {
    id: '2.2',
    designation: 'Pose d\'un nouveau revêtement de sol spécial restaurant',
    quantity: 30,
    unit: 'u',
    unitPrice: 62,
    vat: 20,
    totalHT: 1860,
    parentId: '2',
    level: 2,
    position: 7,
    type: 'Fourniture'
  }
];

const initialQuotes: Quote[] = [
  {
    id: '1',
    number: 'DEV/201907/0045',
    date: '2019-07-04',
    validUntil: '2019-08-03',
    clientId: '1',
    projectId: '1',
    items: initialQuoteItems,
    paymentConditions: 'Acompte de 30 % soit 1199,36 € TTC\nMéthodes de paiement acceptées : Chèque, Virement bancaire, Carte bancaire',
    totalHT: 3419.73,
    totalTVA10: 105.80, 
    totalTVA20: 472.35,
    totalTTC: 3997.88,
    description: 'Rénovation du restaurant rue Rivoli\n(Salle du restaurant et à l\'étage)'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  const addClient = (client: Client) => {
    setClients([...clients, client]);
  };

  const updateClient = (updatedClient: Client) => {
    setClients(clients.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
  };

  const addProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const getNextQuoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Trouver le dernier numéro de devis
    const lastQuoteNumber = quotes.length > 0 
      ? parseInt(quotes[quotes.length - 1].number.split('/')[2]) 
      : 0;
    
    const nextNumber = (lastQuoteNumber + 1).toString().padStart(4, '0');
    
    return `DEV/${year}${month}/${nextNumber}`;
  };

  const createQuote = () => {
    const newQuote: Quote = {
      id: Date.now().toString(),
      number: getNextQuoteNumber(),
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      paymentConditions: 'Acompte de 10 % soit 0,00 € TTC\nMéthodes de paiement acceptées : Chèque, Virement bancaire, Carte bancaire',
      totalHT: 0,
      totalTVA10: 0,
      totalTVA20: 0,
      totalTTC: 0
    };
    
    setQuotes([...quotes, newQuote]);
    setCurrentQuote(newQuote);
    return newQuote;
  };

  const updateQuote = (updatedQuote: Quote) => {
    setQuotes(quotes.map(quote => 
      quote.id === updatedQuote.id ? updatedQuote : quote
    ));
    
    if (currentQuote && currentQuote.id === updatedQuote.id) {
      setCurrentQuote(updatedQuote);
    }
  };

  const deleteQuote = (id: string) => {
    setQuotes(quotes.filter(quote => quote.id !== id));
    
    if (currentQuote && currentQuote.id === id) {
      setCurrentQuote(null);
    }
  };

  const addQuoteItem = (item: Omit<QuoteItem, 'id'>) => {
    if (!currentQuote) return;
    
    const newItem: QuoteItem = {
      ...item,
      id: Date.now().toString()
    };
    
    const updatedQuote = {
      ...currentQuote,
      items: [...currentQuote.items, newItem]
    };
    
    updateQuote(updatedQuote);
  };

  const updateQuoteItem = (updatedItem: QuoteItem) => {
    if (!currentQuote) return;
    
    const updatedItems = currentQuote.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    const updatedQuote = {
      ...currentQuote,
      items: updatedItems
    };
    
    updateQuote(updatedQuote);
  };

  const deleteQuoteItem = (id: string) => {
    if (!currentQuote) return;
    
    const updatedItems = currentQuote.items.filter(item => item.id !== id);
    
    const updatedQuote = {
      ...currentQuote,
      items: updatedItems
    };
    
    updateQuote(updatedQuote);
  };

  // Calculer les totaux à chaque changement dans les items
  useEffect(() => {
    if (currentQuote) {
      let totalHT = 0;
      let totalTVA10 = 0;
      let totalTVA20 = 0;
      
      currentQuote.items.forEach(item => {
        if (item.level > 1) {
          totalHT += item.totalHT;
          
          if (item.vat === 10) {
            totalTVA10 += item.totalHT * 0.1;
          } else if (item.vat === 20) {
            totalTVA20 += item.totalHT * 0.2;
          }
        }
      });
      
      const totalTTC = totalHT + totalTVA10 + totalTVA20;
      const paymentConditions = `Acompte de 10 % soit ${(totalTTC * 0.1).toFixed(2)} € TTC\nMéthodes de paiement acceptées : Chèque, Virement bancaire, Carte bancaire`;
      
      updateQuote({
        ...currentQuote,
        totalHT,
        totalTVA10,
        totalTVA20,
        totalTTC,
        paymentConditions
      });
    }
  }, [currentQuote?.items]);

  const value = {
    clients,
    projects,
    quotes,
    currentQuote,
    addClient,
    updateClient,
    deleteClient,
    addProject,
    updateProject,
    deleteProject,
    createQuote,
    updateQuote,
    deleteQuote,
    setCurrentQuote,
    addQuoteItem,
    updateQuoteItem,
    deleteQuoteItem,
    getNextQuoteNumber
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

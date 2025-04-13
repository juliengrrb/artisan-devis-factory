
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { ClientForm } from "@/components/ClientForm";
import { ProjectForm } from "@/components/ProjectForm";
import { QuoteNumberForm } from "@/components/QuoteNumberForm";
import { QuoteItem as QuoteItemComponent } from "@/components/QuoteItem";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Plus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Quote() {
  const { 
    currentQuote, 
    clients, 
    projects, 
    updateQuote, 
    createQuote,
    updateQuoteItem 
  } = useAppContext();
  
  const navigate = useNavigate();
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showQuoteNumberForm, setShowQuoteNumberForm] = useState(false);
  const [showValiditySelector, setShowValiditySelector] = useState(false);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [validityOptions] = useState([
    "15 jours",
    "30 jours",
    "45 jours",
    "60 jours",
    "90 jours",
    "Date personnalisée"
  ]);
  const [description, setDescription] = useState("");
  const [footerNotes, setFooterNotes] = useState("");

  useEffect(() => {
    if (!currentQuote) {
      const newQuote = createQuote();
      console.log("Created new quote:", newQuote);
    } else {
      setDescription(currentQuote.description || "");
      setFooterNotes(currentQuote.footer || "");
    }
  }, []);

  useEffect(() => {
    if (currentQuote?.description !== undefined) {
      setDescription(currentQuote.description);
    }
    if (currentQuote?.footer !== undefined) {
      setFooterNotes(currentQuote.footer);
    }
  }, [currentQuote]);

  const handleSaveQuote = () => {
    if (!currentQuote) return;
    
    const updatedQuote = {
      ...currentQuote,
      description,
      footer: footerNotes
    };
    
    updateQuote(updatedQuote);
    toast.success("Devis enregistré avec succès");
  };

  const handleClientSelect = (clientId: string) => {
    if (!currentQuote) return;
    
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    const updatedQuote = {
      ...currentQuote,
      clientId,
      client
    };
    
    updateQuote(updatedQuote);
    setShowClientSelector(false);
  };

  const handleValiditySelect = (days: string) => {
    if (!currentQuote) return;
    
    const today = new Date();
    let validUntil: Date;
    
    if (days === "Date personnalisée") {
      // Pour la démonstration, nous utilisons simplement 30 jours
      validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      const numberOfDays = parseInt(days.split(" ")[0]);
      validUntil = new Date(today.getTime() + numberOfDays * 24 * 60 * 60 * 1000);
    }
    
    const updatedQuote = {
      ...currentQuote,
      validUntil: validUntil.toISOString().split("T")[0]
    };
    
    updateQuote(updatedQuote);
    setShowValiditySelector(false);
  };

  const handleEditDate = () => {
    setShowValiditySelector(true);
  };

  const handleAddTitle = () => {
    setDescription(prev => prev + "\nTitre\n");
  };

  const handleAddSubtitle = () => {
    setDescription(prev => prev + "\nSous-titre\n");
  };

  const handleAddText = () => {
    setDescription(prev => prev + "\nTexte à ajouter ici\n");
  };

  const handleAddPageBreak = () => {
    setDescription(prev => prev + "\n[Saut de page]\n");
  };

  const handleAddSection = (type: 'Fourniture' | 'Main d\'oeuvre' | 'Ouvrage') => {
    const newItem = {
      designation: type,
      quantity: 0,
      unit: '',
      unitPrice: 0,
      vat: 0,
      totalHT: 0,
      level: 1,
      position: currentQuote?.items.length || 0
    };
    
    if (currentQuote) {
      const updatedQuote = {
        ...currentQuote,
        items: [...currentQuote.items, newItem]
      };
      
      updateQuote(updatedQuote);
    }
  };

  const handleToggleDescription = () => {
    if (!currentQuote) return;
    
    // Si la description existe, la masquer, sinon l'afficher
    const updatedQuote = {
      ...currentQuote,
      description: currentQuote.description ? "" : description
    };
    
    updateQuote(updatedQuote);
  };

  // Si aucun devis n'est actuellement chargé, affichez un message
  if (!currentQuote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 mb-4">Chargement du devis...</p>
        <Button onClick={() => createQuote()}>Créer un nouveau devis</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header 
        title="Nouveau devis"
        showEditButton={mode === 'preview'}
        showPreviewButton={mode === 'edit'}
        showOptionsButton
        showCancelButton
        showSaveButton
        showFinalizeButton
        onEdit={() => setMode('edit')}
        onPreview={() => setMode('preview')}
        onCancel={() => navigate('/')}
        onSave={handleSaveQuote}
        onFinalize={() => {
          toast.success("Devis finalisé et prêt à être envoyé");
        }}
      />

      <div className="flex-grow p-4 bg-white">
        <div className="bg-white shadow rounded-sm p-6">
          <div className="flex justify-between mb-6">
            <div>
              <div className="flex items-center mb-2">
                <h2 className="text-lg font-semibold mr-2">
                  Devis n°{currentQuote.number}
                </h2>
                <button 
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => setShowQuoteNumberForm(true)}
                >
                  <PenLine className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                En date du {new Date(currentQuote.date).toLocaleDateString('fr-FR')}
              </p>
              <div className="flex items-center">
                <p className="text-sm text-gray-600 mr-2">
                  Valable jusqu'au {new Date(currentQuote.validUntil).toLocaleDateString('fr-FR')}
                </p>
                <button 
                  className="text-blue-500 hover:text-blue-700"
                  onClick={handleEditDate}
                >
                  <PenLine className="h-4 w-4" />
                </button>
                {showValiditySelector && (
                  <div className="absolute mt-20 bg-white border border-gray-200 rounded shadow-lg z-10">
                    <ul className="py-1">
                      {validityOptions.map((option, index) => (
                        <li 
                          key={index} 
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleValiditySelect(option)}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="relative">
                <div 
                  className="p-4 border border-gray-200 rounded cursor-pointer"
                  onClick={() => setShowClientSelector(true)}
                >
                  {currentQuote.client ? (
                    <>
                      <p className="font-medium">
                        {currentQuote.client.civility} {currentQuote.client.firstName} {currentQuote.client.lastName}
                      </p>
                      <p className="text-sm">{currentQuote.client.address}</p>
                      <p className="text-sm">{currentQuote.client.zipCode} {currentQuote.client.city}</p>
                    </>
                  ) : (
                    <p className="text-gray-500">Sélectionner un client</p>
                  )}
                </div>
                
                {showClientSelector && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-10">
                    <div className="p-4 border-b">
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded" 
                        placeholder="Rechercher un client"
                      />
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                      {clients.map(client => (
                        <li 
                          key={client.id} 
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                          onClick={() => handleClientSelect(client.id)}
                        >
                          {client.firstName} {client.lastName}
                        </li>
                      ))}
                      <li className="px-4 py-3 bg-devis-blue text-white text-center cursor-pointer">
                        <button 
                          className="w-full"
                          onClick={() => {
                            setShowClientSelector(false);
                            setShowClientForm(true);
                          }}
                        >
                          Nouveau client
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              {currentQuote.projectId && (
                <div className="mt-4 p-4 border border-gray-200 rounded">
                  <p className="text-gray-600">
                    {projects.find(p => p.id === currentQuote.projectId)?.name}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {(description || currentQuote.description) && (
            <div className="mb-6 relative">
              <button 
                className="absolute top-2 right-2 text-blue-500"
                onClick={handleToggleDescription}
              >
                {currentQuote.description ? "Masquer la description" : "Ajouter une description"}
              </button>
              
              {currentQuote.description && (
                <div className="p-4 border border-gray-200 rounded mb-4">
                  <pre className="whitespace-pre-wrap font-sans">
                    {currentQuote.description}
                  </pre>
                </div>
              )}
              
              {mode === 'edit' && !currentQuote.description && (
                <div className="flex items-start">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description du devis"
                    className="flex-grow mr-2"
                  />
                </div>
              )}
            </div>
          )}
          
          {(!description && !currentQuote.description && mode === 'edit') && (
            <div className="mb-6">
              <button 
                className="text-blue-500 flex items-center"
                onClick={() => setDescription("Rénovation du restaurant rue Rivoli\n(Salle du restaurant et à l'étage)")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter une description
              </button>
            </div>
          )}
          
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-devis-header text-white">
                  <th className="py-2 px-4 text-left w-12">N°</th>
                  <th className="py-2 px-4 text-left">Désignation</th>
                  <th className="py-2 px-4 text-right w-20">Qté</th>
                  <th className="py-2 px-4 text-center w-20">Unité</th>
                  <th className="py-2 px-4 text-right w-28">Prix U. HT</th>
                  <th className="py-2 px-4 text-right w-20">TVA</th>
                  <th className="py-2 px-4 text-right w-32">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {currentQuote.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      Cliquez sur un des boutons ci-dessous pour ajouter un élément à votre document
                    </td>
                  </tr>
                ) : (
                  currentQuote.items.map(item => (
                    <QuoteItemComponent 
                      key={item.id} 
                      item={item} 
                      onUpdate={updateQuoteItem}
                      isEditing={mode === 'edit'}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex mb-6">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={() => handleAddSection('Fourniture')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Fourniture
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={() => handleAddSection('Main d\'oeuvre')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Main d'oeuvre
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={() => handleAddSection('Ouvrage')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ouvrage
              </Button>
            </div>
            
            <div className="flex-grow"></div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={handleAddTitle}
              >
                Titre
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={handleAddSubtitle}
              >
                Sous-titre
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={handleAddText}
              >
                Texte
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={handleAddPageBreak}
              >
                Saut de page
              </Button>
            </div>
          </div>
          
          <div className="flex mb-6">
            <div className="w-1/2">
              <h3 className="text-lg font-semibold mb-4">Conditions de paiement</h3>
              <pre className="whitespace-pre-wrap font-sans">
                {currentQuote.paymentConditions}
              </pre>
            </div>
            
            <div className="w-1/2 pl-8">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-1 text-left">Total net HT</td>
                    <td className="py-1 text-right font-medium">{currentQuote.totalHT.toFixed(2)} €</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-left">TVA 10 %</td>
                    <td className="py-1 text-right">{currentQuote.totalTVA10.toFixed(2)} €</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-left">TVA 20 %</td>
                    <td className="py-1 text-right">{currentQuote.totalTVA20.toFixed(2)} €</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-1 text-left font-semibold">Total TTC</td>
                    <td className="py-1 text-right font-semibold">{currentQuote.totalTTC.toFixed(2)} €</td>
                  </tr>
                </tbody>
              </table>
              
              <div className="mt-4 text-right">
                <button className="text-blue-500 flex items-center justify-end ml-auto">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter une remise
                </button>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Notes de bas de page</h3>
            <Textarea 
              value={footerNotes}
              onChange={(e) => setFooterNotes(e.target.value)}
              placeholder="Ajoutez des notes de bas de page ici"
              className="min-h-[100px] w-full"
            />
          </div>
        </div>
      </div>
      
      {showClientForm && (
        <ClientForm 
          onClose={() => setShowClientForm(false)} 
        />
      )}
      
      {showProjectForm && (
        <ProjectForm 
          clientId={currentQuote.clientId}
          onClose={() => setShowProjectForm(false)} 
        />
      )}
      
      {showQuoteNumberForm && currentQuote && (
        <QuoteNumberForm 
          quote={currentQuote}
          onClose={() => setShowQuoteNumberForm(false)} 
        />
      )}
    </div>
  );
}

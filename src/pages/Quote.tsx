import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { ClientForm } from "@/components/ClientForm";
import { ProjectForm } from "@/components/ProjectForm";
import { QuoteNumberForm } from "@/components/QuoteNumberForm";
import { QuoteItem as QuoteItemComponent } from "@/components/QuoteItem";
import { QuoteSelectors } from "@/components/QuoteSelectors";
import { Button } from "@/components/ui/button";
import { Textarea, EditableTextarea } from "@/components/ui/textarea";
import { PenLine, Plus, FileText, Eye, EyeOff } from "lucide-react";
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
  const [isEditingDescription, setIsEditingDescription] = useState(false);

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
  };

  const handleProjectSelect = (projectId: string) => {
    if (!currentQuote) return;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const updatedQuote = {
      ...currentQuote,
      projectId,
      project
    };
    
    updateQuote(updatedQuote);
  };

  const handleValiditySelect = (days: string) => {
    if (!currentQuote) return;
    
    const today = new Date();
    let validUntil: Date;
    
    if (days === "Date personnalisée") {
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
      id: Date.now().toString(),
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
    
    const updatedQuote = {
      ...currentQuote,
      description: currentQuote.description ? "" : description
    };
    
    updateQuote(updatedQuote);
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
  };

  const handleSaveDescription = () => {
    if (!currentQuote) return;
    
    updateQuote({
      ...currentQuote,
      description
    });
    
    setIsEditingDescription(false);
    toast.success("Description mise à jour");
  };

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
        <div className="flex">
          <div className="flex-1">
            <div className="bg-white rounded-sm">
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

                <div className="w-72">
                  <QuoteSelectors 
                    onClientSelect={handleClientSelect}
                    onProjectSelect={handleProjectSelect}
                    selectedClientId={currentQuote.clientId}
                    selectedProjectId={currentQuote.projectId}
                  />
                </div>
              </div>
              
              <div className="mb-6 relative">
                {mode === 'edit' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-blue-500 z-10"
                    onClick={() => {
                      if (currentQuote.description) {
                        updateQuote({
                          ...currentQuote,
                          description: ""
                        });
                      } else {
                        setIsEditingDescription(!isEditingDescription);
                      }
                    }}
                  >
                    {currentQuote.description ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Masquer la description
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        {isEditingDescription ? "Annuler" : "Ajouter une description"}
                      </>
                    )}
                  </Button>
                )}
                
                {currentQuote.description ? (
                  <div 
                    className="mb-4" 
                    onClick={() => setIsEditingDescription(true)}
                  >
                    <pre className="whitespace-pre-wrap font-sans">
                      {currentQuote.description}
                    </pre>
                  </div>
                ) : mode === 'edit' && (
                  <div className="mb-4">
                    {isEditingDescription ? (
                      <div className="space-y-2">
                        <Textarea
                          value={description}
                          onChange={(e) => handleDescriptionChange(e.target.value)}
                          placeholder="Description du devis"
                          className="w-full border-none focus:ring-0 resize-none"
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingDescription(false)}
                          >
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveDescription}
                          >
                            Enregistrer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost"
                        className="text-blue-500 flex items-center"
                        onClick={() => setIsEditingDescription(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une description
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
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
        </div>
      </div>
      
      {showQuoteNumberForm && currentQuote && (
        <QuoteNumberForm 
          quote={currentQuote}
          onClose={() => setShowQuoteNumberForm(false)} 
        />
      )}
    </div>
  );
}

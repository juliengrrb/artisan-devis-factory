
import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { ClientForm } from "@/components/ClientForm";
import { ProjectForm } from "@/components/ProjectForm";
import { QuoteNumberForm } from "@/components/QuoteNumberForm";
import { QuoteItem as QuoteItemComponent } from "@/components/QuoteItem";
import { QuoteSelectors } from "@/components/QuoteSelectors";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Plus, Eye, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuoteItem } from "@/types";

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
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

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

  const getItemNumber = (item: QuoteItem, index: number, items: QuoteItem[]) => {
    if (item.type === 'Texte' || item.type === 'Saut de page') {
      return ''; // Text and page break items don't have numbering
    }
    
    let sectionCounter = 0;
    let subsectionCounter = 0;
    let itemCounter = 0;
    
    for (let i = 0; i <= index; i++) {
      const currentItem = items[i];
      
      if (currentItem.type === 'Texte' || currentItem.type === 'Saut de page') {
        continue;
      }
      
      if (currentItem.type === 'Titre') {
        sectionCounter++;
        subsectionCounter = 0;
        itemCounter = 0;
      } else if (currentItem.type === 'Sous-titre') {
        subsectionCounter++;
        itemCounter = 0;
      } else if (['Fourniture', 'Main d\'oeuvre', 'Ouvrage'].includes(currentItem.type || '')) {
        itemCounter++;
      }
      
      if (i === index) {
        break;
      }
    }
    
    if (item.type === 'Titre') {
      return `${sectionCounter}`;
    } else if (item.type === 'Sous-titre') {
      return `${sectionCounter}.${subsectionCounter}`;
    } else if (['Fourniture', 'Main d\'oeuvre', 'Ouvrage'].includes(item.type || '')) {
      if (subsectionCounter > 0) {
        return `${sectionCounter}.${subsectionCounter}.${itemCounter}`;
      }
      return `${sectionCounter}.${itemCounter}`;
    }
    
    return '';
  };

  const handleDragStart = (id: string) => {
    setDraggedItemId(id);
  };

  const handleDragOver = useCallback((targetId: string) => {
    if (!currentQuote || !draggedItemId || draggedItemId === targetId) return;

    const items = [...currentQuote.items];
    const draggedItemIndex = items.findIndex(item => item.id === draggedItemId);
    const targetItemIndex = items.findIndex(item => item.id === targetId);
    
    if (draggedItemIndex === -1 || targetItemIndex === -1) return;

    // Reorder the items
    const draggedItem = items[draggedItemIndex];
    items.splice(draggedItemIndex, 1);
    items.splice(targetItemIndex, 0, draggedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));

    updateQuote({
      ...currentQuote,
      items: updatedItems
    });
  }, [currentQuote, draggedItemId, updateQuote]);

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

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
    if (!currentQuote) return;
    
    const newItem = {
      id: `text-${Date.now()}`,
      designation: "", // Empty designation so user can type directly
      quantity: 0,
      unit: '',
      unitPrice: 0,
      vat: 0,
      totalHT: 0,
      type: 'Titre' as const,
      level: 1,
      position: currentQuote.items.length
    };
    
    const updatedQuote = {
      ...currentQuote,
      items: [...currentQuote.items, newItem]
    };
    
    updateQuote(updatedQuote);
    toast.success("Titre ajouté");
  };

  const handleAddSubtitle = () => {
    if (!currentQuote) return;
    
    const newItem = {
      id: `text-${Date.now()}`,
      designation: "", // Empty designation so user can type directly
      quantity: 0,
      unit: '',
      unitPrice: 0,
      vat: 0,
      totalHT: 0,
      type: 'Sous-titre' as const,
      level: 2,
      position: currentQuote.items.length
    };
    
    const updatedQuote = {
      ...currentQuote,
      items: [...currentQuote.items, newItem]
    };
    
    updateQuote(updatedQuote);
    toast.success("Sous-titre ajouté");
  };

  const handleAddPageBreak = () => {
    if (!currentQuote) return;
    
    const newItem = {
      id: `page-break-${Date.now()}`,
      designation: "Saut de page",
      quantity: 0,
      unit: '',
      unitPrice: 0,
      vat: 0,
      totalHT: 0,
      type: 'Saut de page' as const,
      level: 1,
      position: currentQuote.items.length
    };
    
    const updatedQuote = {
      ...currentQuote,
      items: [...currentQuote.items, newItem]
    };
    
    updateQuote(updatedQuote);
    toast.success("Saut de page ajouté");
  };

  const handleAddSection = (type: 'Fourniture' | 'Main d\'oeuvre' | 'Ouvrage') => {
    if (!currentQuote) return;
    
    const newItem = {
      id: Date.now().toString(),
      designation: type,
      quantity: 0,
      unit: '',
      unitPrice: 0,
      vat: 0,
      totalHT: 0,
      level: 1,
      position: currentQuote.items.length || 0
    };
    
    const updatedQuote = {
      ...currentQuote,
      items: [...currentQuote.items, newItem]
    };
    
    updateQuote(updatedQuote);
    toast.success(`${type} ajouté`);
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

  const handleToggleEditDescription = () => {
    setIsEditingDescription(!isEditingDescription);
  };

  const handleFooterNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFooterNotes(e.target.value);

    // Auto-save footer notes on change
    if (currentQuote) {
      updateQuote({
        ...currentQuote,
        footer: e.target.value
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isEditingDescription) {
      handleSaveDescription();
    }
  };

  // Calculate totals each time the quote items change
  const calculateTotals = () => {
    if (!currentQuote) return { totalHT: 0, totalTVA10: 0, totalTVA20: 0, totalTTC: 0 };
    
    let totalHT = 0;
    let totalTVA10 = 0;
    let totalTVA20 = 0;
    
    currentQuote.items.forEach(item => {
      if (
        ['Fourniture', 'Main d\'oeuvre', 'Ouvrage'].includes(item.type || '') ||
        item.type === 'Titre' ||
        item.type === 'Sous-titre'
      ) {
        totalHT += item.totalHT;
        
        if (item.vat === 10) {
          totalTVA10 += item.totalHT * 0.1;
        } else if (item.vat === 20) {
          totalTVA20 += item.totalHT * 0.2;
        }
      }
    });
    
    const totalTTC = totalHT + totalTVA10 + totalTVA20;
    
    return { totalHT, totalTVA10, totalTVA20, totalTTC };
  };

  const { totalHT, totalTVA10, totalTVA20, totalTTC } = calculateTotals();

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
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex justify-between mb-4">
                <div>
                  <div className="flex items-center mb-2">
                    <h2 className="text-lg font-medium mr-2 text-devis">
                      Devis n°{currentQuote.number}
                    </h2>
                    <button 
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => setShowQuoteNumberForm(true)}
                    >
                      <PenLine className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-devis-light">
                    En date du {new Date(currentQuote.date).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="flex items-center">
                    <p className="text-sm text-devis-light mr-2">
                      Valable jusqu'au {new Date(currentQuote.validUntil).toLocaleDateString('fr-FR')}
                    </p>
                    <button 
                      className="text-blue-500 hover:text-blue-700"
                      onClick={handleEditDate}
                    >
                      <PenLine className="h-4 w-4" />
                    </button>
                    {showValiditySelector && (
                      <div className="absolute mt-20 bg-white border border-gray-200 rounded shadow-lg z-10 popup-devis">
                        <ul className="py-1">
                          {validityOptions.map((option, index) => (
                            <li 
                              key={index} 
                              className="px-4 py-1 hover:bg-gray-50 cursor-pointer text-sm"
                              onClick={() => handleValiditySelect(option)}
                            >
                              {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {mode === 'edit' && (
                    <div className="mt-2">
                      {!currentQuote.description && !isEditingDescription ? (
                        <Button 
                          variant="ghost"
                          className="text-devis-orange flex items-center btn-devis p-0 hover:bg-transparent"
                          onClick={() => setIsEditingDescription(true)}
                        >
                          <Plus className="h-4 w-4 text-devis-orange mr-1" />
                          <span className="text-devis-orange">Ajouter une description</span>
                        </Button>
                      ) : null}
                    </div>
                  )}
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
              
              <div className="mb-4 relative">
                {currentQuote.description && !isEditingDescription ? (
                  <div className="mb-4 relative">
                    {mode === 'edit' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-blue-500 z-10 btn-devis"
                        onClick={() => setIsEditingDescription(true)}
                      >
                        <PenLine className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    )}
                    <div className="p-4 bg-gray-50 rounded">
                      <pre className="whitespace-pre-wrap font-sans text-devis text-sm">
                        {currentQuote.description}
                      </pre>
                    </div>
                  </div>
                ) : mode === 'edit' && isEditingDescription ? (
                  <div className="mb-4">
                    <div className="space-y-2">
                      <Textarea
                        value={description}
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Description du devis"
                        className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none text-sm form-control-devis"
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-devis btn-devis"
                          onClick={() => setIsEditingDescription(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          className="bg-devis-blue hover:bg-blue-600 text-white btn-devis"
                          onClick={handleSaveDescription}
                        >
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              
              <div className="mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-devis-blue text-white">
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
                      <tr className="bg-white">
                        <td colSpan={7} className="py-4 text-center text-devis-light">
                          Cliquez sur un des boutons ci-dessous pour ajouter un élément à votre document
                        </td>
                      </tr>
                    ) : (
                      currentQuote.items.map((item, index) => (
                        <QuoteItemComponent 
                          key={item.id} 
                          item={item} 
                          onUpdate={updateQuoteItem}
                          isEditing={mode === 'edit'}
                          itemNumber={getItemNumber(item, index, currentQuote.items)}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDragEnd={handleDragEnd}
                          draggedItemId={draggedItemId}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="flex mb-4">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-devis-light hover:bg-gray-50 btn-devis"
                    onClick={() => handleAddSection('Fourniture')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Fourniture
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-devis-light hover:bg-gray-50 btn-devis"
                    onClick={() => handleAddSection('Main d\'oeuvre')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Main d'oeuvre
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-devis-light hover:bg-gray-50 btn-devis"
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
                    className="border-gray-300 text-devis-light hover:bg-gray-50 btn-devis"
                    onClick={handleAddTitle}
                  >
                    Titre
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-devis-light hover:bg-gray-50 btn-devis"
                    onClick={handleAddSubtitle}
                  >
                    Sous-titre
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-devis-light hover:bg-gray-50 btn-devis"
                    onClick={handleAddPageBreak}
                  >
                    Saut de page
                  </Button>
                </div>
              </div>
              
              <div className="flex mb-4">
                <div className="w-1/2">
                  <h3 className="text-md font-medium mb-3 text-devis">Conditions de paiement</h3>
                  <pre className="whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded text-sm text-devis">
                    {currentQuote.paymentConditions}
                  </pre>
                </div>
                
                <div className="w-1/2 pl-8">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="py-1 text-left text-sm">Total net HT</td>
                        <td className="py-1 text-right font-medium text-sm">{totalHT.toFixed(2)} €</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-left text-sm">TVA 10 %</td>
                        <td className="py-1 text-right text-sm">{totalTVA10.toFixed(2)} €</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-left text-sm">TVA 20 %</td>
                        <td className="py-1 text-right text-sm">{totalTVA20.toFixed(2)} €</td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="py-1 text-left font-medium text-devis text-sm">Total TTC</td>
                        <td className="py-1 text-right font-medium text-devis text-sm">{totalTTC.toFixed(2)} €</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="mt-3 text-right">
                    <button className="text-blue-500 flex items-center justify-end ml-auto hover:text-blue-700 text-sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une remise
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-md font-medium mb-3 text-devis">Notes de bas de page</h3>
                <Textarea 
                  value={footerNotes}
                  onChange={handleFooterNotesChange}
                  placeholder="Ajoutez des notes de bas de page ici"
                  className="min-h-[80px] w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm form-control-devis"
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

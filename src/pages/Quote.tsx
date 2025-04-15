
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
import { 
  PenLine, 
  Plus, 
  Eye, 
  Hash, 
  Percent, 
  Euro, 
  CheckCircle2, 
  Check 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuoteItem } from "@/types";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [totals, setTotals] = useState({ 
    totalHT: 0, 
    totalTVA10: 0, 
    totalTVA20: 0, 
    totalTTC: 0,
    discount: 0,
    discountType: '%',
    discountAmount: 0,
    netTotalHT: 0
  });
  
  const [isEditingDownPayment, setIsEditingDownPayment] = useState(false);
  const [downPaymentValue, setDownPaymentValue] = useState("10");
  const [downPaymentType, setDownPaymentType] = useState<'%' | '€'>('%');
  const [downPaymentAmount, setDownPaymentAmount] = useState(0);
  const [hasDownPayment, setHasDownPayment] = useState(false);
  
  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const [discountValue, setDiscountValue] = useState("0.00");
  const [discountType, setDiscountType] = useState<'%' | '€ HT' | '€ TTC'>('%');
  const [hasDiscount, setHasDiscount] = useState(false);

  useEffect(() => {
    if (!currentQuote) {
      const newQuote = createQuote();
      console.log("Created new quote:", newQuote);
    } else {
      setDescription(currentQuote.description || "");
      setFooterNotes(currentQuote.footer || "");
      
      const calculatedTotals = calculateTotals(currentQuote.items);
      setTotals(calculatedTotals);
      
      // Check if current quote has a payment condition with acompte
      if (currentQuote.paymentConditions && currentQuote.paymentConditions.includes('Acompte')) {
        setHasDownPayment(true);
        
        // Extract the down payment percentage from the string
        const match = currentQuote.paymentConditions.match(/Acompte de (\d+) %/);
        if (match && match[1]) {
          setDownPaymentValue(match[1]);
          setDownPaymentType('%');
          
          // Calculate down payment amount
          setDownPaymentAmount((calculatedTotals.totalTTC * parseInt(match[1])) / 100);
        }
      }
      
      // Check if current quote has a discount
      if (currentQuote.discount) {
        setHasDiscount(true);
        setDiscountValue(currentQuote.discount.toString());
        setDiscountType(currentQuote.discountType || '%');
      }
    }
  }, []);

  useEffect(() => {
    if (currentQuote?.description !== undefined) {
      setDescription(currentQuote.description);
    }
    if (currentQuote?.footer !== undefined) {
      setFooterNotes(currentQuote.footer);
    }
    
    if (currentQuote?.items) {
      const calculatedTotals = calculateTotals(currentQuote.items);
      setTotals(calculatedTotals);
      
      if (hasDownPayment && downPaymentType === '%') {
        setDownPaymentAmount((calculatedTotals.totalTTC * parseFloat(downPaymentValue)) / 100);
      }
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

    const draggedItem = items[draggedItemIndex];
    items.splice(draggedItemIndex, 1);
    items.splice(targetItemIndex, 0, draggedItem);

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

  const formatCurrency = (value: number): string => {
    return `${value.toFixed(2)} €`;
  };

  const handleSaveQuote = () => {
    if (!currentQuote) return;
    
    const calculatedTotals = calculateTotals(currentQuote.items);
    
    const updatedQuote = {
      ...currentQuote,
      description,
      footer: footerNotes,
      ...calculatedTotals
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
      type,
      level: 1,
      position: currentQuote.items.length || 0
    };
    
    const updatedQuote = {
      ...currentQuote,
      items: [...currentQuote.items, newItem]
    };
    
    updateQuote(updatedQuote);
    
    const newTotals = calculateTotals(updatedQuote.items);
    setTotals(newTotals);
    
    updateQuote({
      ...updatedQuote,
      ...newTotals
    });
    
    toast.success(`${type} ajouté`);
  };

  const handleUpdateQuoteItem = (updatedItem: QuoteItem) => {
    if (!currentQuote) return;
    
    const updatedItems = currentQuote.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    const newTotals = calculateTotals(updatedItems);
    
    const updatedQuote = {
      ...currentQuote,
      items: updatedItems,
      ...newTotals
    };
    
    updateQuote(updatedQuote);
    
    setTotals(newTotals);
    
    if (hasDownPayment && downPaymentType === '%') {
      setDownPaymentAmount((newTotals.totalTTC * parseFloat(downPaymentValue)) / 100);
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

  const handleToggleEditDescription = () => {
    setIsEditingDescription(!isEditingDescription);
  };

  const handleFooterNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFooterNotes(e.target.value);

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

  // Handle focus on number inputs to clear initial zero values
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.type === 'number' && (e.target.value === '0' || e.target.value === '0.00')) {
      e.target.value = '';
    }
  };

  const calculateTotals = (items?: QuoteItem[]) => {
    if (!items || items.length === 0) {
      return { 
        totalHT: 0, 
        totalTVA10: 0, 
        totalTVA20: 0, 
        totalTTC: 0,
        discount: hasDiscount ? parseFloat(discountValue) || 0 : 0,
        discountType: discountType,
        discountAmount: 0,
        netTotalHT: 0
      };
    }
    
    let totalHT = 0;
    let totalTVA10 = 0;
    let totalTVA20 = 0;
    
    items.forEach(item => {
      if (
        ['Fourniture', 'Main d\'oeuvre', 'Ouvrage'].includes(item.type || '')
      ) {
        const itemTotal = typeof item.totalHT === 'string' 
          ? parseFloat(item.totalHT) 
          : (item.totalHT || 0);
          
        totalHT += itemTotal;
        
        const vatRate = typeof item.vat === 'string' 
          ? parseFloat(item.vat) 
          : (item.vat || 0);
        
        if (vatRate === 10) {
          totalTVA10 += itemTotal * 0.1;
        } else if (vatRate === 20) {
          totalTVA20 += itemTotal * 0.2;
        }
      }
    });
    
    let discountAmount = 0;
    let netTotalHT = totalHT;
    
    if (hasDiscount) {
      const discountVal = parseFloat(discountValue) || 0;
      
      if (discountType === '%') {
        discountAmount = totalHT * (discountVal / 100);
        netTotalHT = totalHT - discountAmount;
      } else if (discountType === '€ HT') {
        discountAmount = discountVal;
        netTotalHT = totalHT - discountAmount;
      } else if (discountType === '€ TTC') {
        const currentTTC = totalHT + totalTVA10 + totalTVA20;
        const ratio = totalHT / currentTTC;
        discountAmount = discountVal * ratio;
        netTotalHT = totalHT - discountAmount;
      }
    } else {
      netTotalHT = totalHT;
    }
    
    let adjustedTVA10 = 0;
    let adjustedTVA20 = 0;
    
    if (totalHT > 0) {
      adjustedTVA10 = (totalTVA10 / totalHT) * netTotalHT;
      adjustedTVA20 = (totalTVA20 / totalHT) * netTotalHT;
    }
    
    const totalTTC = netTotalHT + adjustedTVA10 + adjustedTVA20;
    
    return { 
      totalHT: Number(totalHT.toFixed(2)), 
      totalTVA10: Number(adjustedTVA10.toFixed(2)), 
      totalTVA20: Number(adjustedTVA20.toFixed(2)), 
      totalTTC: Number(totalTTC.toFixed(2)),
      discount: hasDiscount ? parseFloat(discountValue) || 0 : 0,
      discountType: discountType,
      discountAmount: Number(discountAmount.toFixed(2)),
      netTotalHT: Number(netTotalHT.toFixed(2))
    };
  };

  const handleAddDownPayment = () => {
    setIsEditingDownPayment(true);
    setHasDownPayment(true);
  };

  const handleEditDownPayment = () => {
    setIsEditingDownPayment(true);
  };

  const handleDownPaymentValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDownPaymentValue(e.target.value);
    
    if (downPaymentType === '%') {
      const newAmount = (totals.totalTTC * parseFloat(e.target.value || '0')) / 100;
      setDownPaymentAmount(newAmount);
    } else {
      setDownPaymentAmount(parseFloat(e.target.value || '0'));
    }
  };

  const handleDownPaymentTypeChange = (type: '%' | '€') => {
    setDownPaymentType(type);
    
    if (type === '%') {
      const newAmount = (totals.totalTTC * parseFloat(downPaymentValue || '0')) / 100;
      setDownPaymentAmount(newAmount);
    } else {
      setDownPaymentAmount(parseFloat(downPaymentValue || '0'));
    }
  };

  const handleSaveDownPayment = () => {
    if (!currentQuote) return;
    
    const paymentAmount = downPaymentType === '%' ? 
      (totals.totalTTC * parseFloat(downPaymentValue || '0')) / 100 : 
      parseFloat(downPaymentValue || '0');
    
    const paymentConditions = `Acompte de ${downPaymentValue} ${downPaymentType} soit ${paymentAmount.toFixed(2)} € TTC
Méthodes de paiement acceptées : Chèque, Virement bancaire, Carte bancaire`;
    
    updateQuote({
      ...currentQuote,
      paymentConditions
    });
    
    setIsEditingDownPayment(false);
    setHasDownPayment(true);
    
    toast.success("Acompte mis à jour");
  };

  const handleCancelDownPayment = () => {
    if (currentQuote && hasDownPayment) {
      const match = currentQuote.paymentConditions.match(/Acompte de (\d+) %/);
      if (match && match[1]) {
        setDownPaymentValue(match[1]);
        setDownPaymentType('%');
      } else {
        setDownPaymentValue("10");
        setDownPaymentType('%');
      }
    } else {
      setDownPaymentValue("10");
      setDownPaymentType('%');
    }
    
    setIsEditingDownPayment(false);
  };

  const handleAddDiscount = () => {
    setIsAddingDiscount(true);
  };

  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountValue(e.target.value);
    setHasDiscount(true);
    
    if (currentQuote) {
      const newTotals = calculateTotals(currentQuote.items);
      setTotals(newTotals);
    }
  };

  const handleDiscountTypeChange = (type: '%' | '€ HT' | '€ TTC') => {
    setDiscountType(type);
    
    if (currentQuote) {
      const newTotals = calculateTotals(currentQuote.items);
      setTotals(newTotals);
    }
  };

  const handleSaveDiscount = () => {
    setIsAddingDiscount(false);
    setHasDiscount(true);
    
    if (currentQuote) {
      const newTotals = calculateTotals(currentQuote.items);
      
      updateQuote({
        ...currentQuote,
        totalHT: newTotals.totalHT,
        totalTVA10: newTotals.totalTVA10,
        totalTVA20: newTotals.totalTVA20,
        totalTTC: newTotals.totalTTC,
        discount: parseFloat(discountValue) || 0,
        discountType: discountType,
        discountAmount: newTotals.discountAmount,
        netTotalHT: newTotals.netTotalHT
      });
      
      setTotals(newTotals);
      
      toast.success("Remise mise à jour");
    }
  };

  const handleCancelDiscount = () => {
    setIsAddingDiscount(false);
    
    if (!hasDiscount) {
      setDiscountValue("0.00");
      setDiscountType('%');
    }
  };

  const handleEditDiscount = () => {
    setIsAddingDiscount(true);
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
                          variant="orange"
                          className="add-description-btn p-0 flex items-center"
                          onClick={() => setIsEditingDescription(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          <span>Ajouter une description</span>
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
                      <th className="py-2 px-4 text-center w-20">TVA</th>
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
                          onUpdate={handleUpdateQuoteItem}
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
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-medium text-devis">Conditions de paiement</h3>
                    {!hasDownPayment && !isEditingDownPayment && (
                      <button
                        className="text-[#3399ff] hover:text-blue-700 flex items-center text-sm ml-2"
                        onClick={handleAddDownPayment}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        <span>Ajouter un acompte</span>
                      </button>
                    )}
                  </div>
                  
                  {isEditingDownPayment ? (
                    <div className="py-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm">Acompte de</span>
                        <Input
                          type="number"
                          value={downPaymentValue}
                          onChange={handleDownPaymentValueChange}
                          onFocus={handleFocus}
                          className="w-24 h-8 text-sm border-gray-300"
                        />
                        <span className="text-sm">%</span>
                        <span className="text-sm ml-2">
                          ({downPaymentAmount.toFixed(2)} € TTC)
                        </span>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancelDownPayment}
                          className="border-gray-300 text-sm"
                        >
                          Annuler
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveDownPayment}
                          className="bg-devis-blue text-white text-sm hover:bg-blue-600"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Valider
                        </Button>
                      </div>
                    </div>
                  ) : hasDownPayment ? (
                    <div className="bg-gray-50 p-3 rounded">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-devis">
                        {currentQuote.paymentConditions}
                      </pre>
                      <div className="mt-2">
                        <Button
                          variant="orange"
                          className="text-[#3399ff] hover:text-blue-700 flex items-center p-0 bg-transparent hover:bg-transparent text-sm"
                          onClick={handleEditDownPayment}
                        >
                          <PenLine className="h-4 w-4 mr-1" />
                          <span>Modifier l'acompte</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded h-24 flex items-center justify-center">
                      <p className="text-sm text-gray-500">Aucune condition de paiement définie</p>
                    </div>
                  )}
                </div>
                
                <div className="w-1/2 pl-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-medium text-devis invisible">Totaux</h3>
                    {!hasDiscount && !isAddingDiscount && (
                      <button
                        onClick={handleAddDiscount}
                        className="text-[#3399ff] flex items-center justify-end ml-auto hover:text-blue-700 text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une remise
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                    <table className="w-full">
                      <tbody>
                        {hasDiscount && (
                          <>
                            <tr>
                              <td className="py-1 text-left text-sm">Sous-total HT</td>
                              <td className="py-1 text-right font-medium text-sm">{formatCurrency(totals.totalHT)}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-left text-sm flex items-center">
                                Remise globale
                                {isAddingDiscount ? (
                                  <div className="flex items-center ml-2">
                                    <Input
                                      type="number"
                                      value={discountValue}
                                      onChange={handleDiscountValueChange}
                                      onFocus={handleFocus}
                                      className="w-20 h-7 text-sm border-gray-300 mr-1"
                                    />
                                    <DropdownMenu>
                                      <DropdownMenuTrigger className="flex items-center justify-between border border-gray-300 rounded px-2 py-1 text-sm w-16 bg-white">
                                        {discountType}
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleDiscountTypeChange('%')}>
                                          <span className="text-sm">%</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDiscountTypeChange('€ HT')}>
                                          <span className="text-sm">€ HT</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDiscountTypeChange('€ TTC')}>
                                          <span className="text-sm">€ TTC</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="ml-2 p-0 border-none shadow-none h-6 text-blue-500 hover:text-blue-700 hover:bg-transparent"
                                    onClick={handleEditDiscount}
                                  >
                                    <PenLine className="h-3 w-3 mr-1" />
                                  </Button>
                                )}
                              </td>
                              <td className="py-1 text-right text-sm">{formatCurrency(totals.discountAmount)}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-left font-medium text-sm">Total net HT</td>
                              <td className="py-1 text-right font-medium text-sm">{formatCurrency(totals.netTotalHT)}</td>
                            </tr>
                          </>
                        )}
                        
                        {(!hasDiscount || !isAddingDiscount) && (
                          <tr>
                            <td className="py-1 text-left text-sm">Total net HT</td>
                            <td className="py-1 text-right font-medium text-sm">{formatCurrency(hasDiscount ? totals.netTotalHT : totals.totalHT)}</td>
                          </tr>
                        )}
                        
                        <tr>
                          <td className="py-1 text-left text-sm">TVA 10 %</td>
                          <td className="py-1 text-right text-sm">{formatCurrency(totals.totalTVA10)}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-left text-sm">TVA 20 %</td>
                          <td className="py-1 text-right text-sm">{formatCurrency(totals.totalTVA20)}</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="py-2 text-left font-medium text-devis">Total TTC</td>
                          <td className="py-2 text-right font-medium text-devis">{formatCurrency(totals.totalTTC)}</td>
                        </tr>
                      </tbody>
                    </table>
                    
                    {isAddingDiscount && (
                      <div className="mt-3 flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancelDiscount}
                          className="text-sm"
                        >
                          Annuler
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveDiscount}
                          className="bg-devis-blue hover:bg-blue-600 text-white text-sm"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Valider
                        </Button>
                      </div>
                    )}
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

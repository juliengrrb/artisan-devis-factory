
import React, { useMemo, useEffect, useState } from "react";
import { 
  Edit, 
  Eye, 
  Plus, 
  X, 
  ChevronDown, 
  Pencil, 
  CirclePlus, 
  Settings, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Interfaces locales
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  civility: string;
  address: string;
  zipCode: string;
  city: string;
  email?: string;
  phone?: string;
  type?: "particulier" | "professionnel";
}

interface Project {
  id: string;
  name: string;
  description?: string;
  client: string; // client ID
  differentAddress?: boolean;
  address?: string;
}

// Interface mise à jour avec les propriétés d'édition
interface LineItem {
  id: string;
  designation: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  vat?: number;
  totalHT: number;
  type: "Titre" | "Sous-titre" | "Texte" | "Fourniture" | "Main d'oeuvre" | "Ouvrage" | "Saut de page";
  level: number;
  parentId?: string;
  details?: string[];
  isEditable?: boolean;
  isEditableQty?: boolean;
  isEditableUnit?: boolean;
  isEditablePU?: boolean;
  isEditableTVA?: boolean;
}

// Ce composant remplace entièrement l'ancien éditeur de devis
export default function InvoiceCreator() {
  // Backend context
  const {
    currentQuote,
    clients,
    projects,
    updateQuote,
    setCurrentQuote,
    addQuoteItem,
    updateQuoteItem,
    deleteQuoteItem,
    createQuote,
  } = useAppContext();
  const navigate = useNavigate();

  // Modes édition/prévisualisation
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  
  // Visibility states
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const [showDiscount, setShowDiscount] = useState<boolean>(false);
  const [showDepositInput, setShowDepositInput] = useState<boolean>(false);
  
  // Dropdowns
  const [showClientDropdown, setShowClientDropdown] = useState<boolean>(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState<boolean>(false);

  // Dialog modals
  const [showNumberFormatModal, setShowNumberFormatModal] = useState<boolean>(false);
  const [showValidityModal, setShowValidityModal] = useState<boolean>(false);
  const [showClientModal, setShowClientModal] = useState<boolean>(false);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);

  // On permet d'éditer la description (petit état local sinon on override tout le quote)
  const [description, setDescription] = useState("");
  const [depositPercentage, setDepositPercentage] = useState<number>(10);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");

  // State for client form
  const [clientType, setClientType] = useState<"particulier" | "professionnel">("particulier");
  const [clientTitle, setClientTitle] = useState("M");
  const [clientLastName, setClientLastName] = useState("");
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientAddressComplement, setClientAddressComplement] = useState("");
  const [clientPostalCode, setClientPostalCode] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientCountry, setClientCountry] = useState("France");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // State for project form
  const [projectName, setProjectName] = useState("");
  const [projectDifferentAddress, setProjectDifferentAddress] = useState(false);
  const [projectNotes, setProjectNotes] = useState("");

  // Number format
  const [numberPrefix, setNumberPrefix] = useState("DEV");
  const [numberSeparator, setNumberSeparator] = useState("-");
  const [dateFormat, setDateFormat] = useState("year+month");
  const [numberLength, setNumberLength] = useState("5");
  const [currentNumber, setCurrentNumber] = useState("28");
  const [quoteDate, setQuoteDate] = useState(new Date().toLocaleDateString("fr-FR"));
  const [validUntil, setValidUntil] = useState(
    new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString("fr-FR")
  );
  const [validityPeriod, setValidityPeriod] = useState("30 Jours");

  useEffect(() => {
    // Toujours avoir un devis courant existant pour édition
    if (!currentQuote) createQuote();
    
    // Initialiser les données du formulaire depuis le devis courant
    if (currentQuote) {
      if (currentQuote.description) {
        setDescription(currentQuote.description);
        setShowDescription(true);
      }
      
      if (currentQuote.paymentConditions) {
        const match = currentQuote.paymentConditions.match(/Acompte de (\d+) %/);
        if (match && match[1]) {
          setDepositPercentage(parseInt(match[1]));
        }
      }
    }
  }, [currentQuote, createQuote]);

  // Utilitaires pour l'affichage
  const formatDate = (date?: string | Date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR");
  };
  
  const formatCurrency = (n?: number) => (n ? n.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €" : "0,00 €");

  // Calcul des totaux
  const subtotalHT = currentQuote?.totalHT || 0;
  const totalTTC = currentQuote?.totalTTC || 0;
  
  // Calcul du montant de l'acompte
  const depositAmount = (totalTTC * depositPercentage) / 100;

  // Informations TVA
  const tvaTotals = [
    { rate: 10, amount: currentQuote?.totalTVA10 || 0 },
    { rate: 20, amount: currentQuote?.totalTVA20 || 0 }
  ].filter(tva => tva.amount > 0);

  // Utilitaire : numérotation automatique
  const buildNumber = (item: any, index: number, items: any[]) => {
    if(item.type === "Titre") {
      // Pour les titres, on utilise juste leur position
      const titleIndex = items.filter((it, idx) => it.type === "Titre" && idx <= index).length;
      return `${titleIndex}`;
    }
    
    if(item.type === "Sous-titre") {
      // Pour les sous-titres, on cherche le dernier titre avant
      let lastTitleIndex = 0;
      for(let i = index; i >= 0; i--) {
        if(items[i].type === "Titre") {
          lastTitleIndex = items.filter((it, idx) => it.type === "Titre" && idx <= i).length;
          break;
        }
      }
      
      // Compter combien de sous-titres après ce titre et avant cet index
      let subTitleCount = 0;
      let foundTitle = false;
      for(let i = 0; i < index; i++) {
        if(!foundTitle && items[i].type === "Titre") {
          if(items.filter((it, idx) => it.type === "Titre" && idx <= i).length === lastTitleIndex) {
            foundTitle = true;
          }
        }
        
        if(foundTitle && items[i].type === "Sous-titre") {
          subTitleCount++;
        }
      }
      
      return `${lastTitleIndex}.${subTitleCount + 1}`;
    }
    
    if(item.type === "Fourniture" || item.type === "Main d'oeuvre" || item.type === "Ouvrage") {
      // Pour les autres types, on cherche le dernier sous-titre ou titre
      let prefix = "";
      let itemCount = 0;
      
      // Chercher le dernier titre ou sous-titre
      for(let i = index; i >= 0; i--) {
        if(items[i].type === "Sous-titre") {
          // Utiliser le numéro du sous-titre comme préfixe
          prefix = buildNumber(items[i], i, items);
          break;
        } else if(items[i].type === "Titre") {
          // Si on trouve un titre sans sous-titre avant, on utilise le titre
          prefix = buildNumber(items[i], i, items);
          break;
        }
      }
      
      // Compter combien d'éléments du même type après le préfixe et avant cet index
      let foundAnchor = false;
      for(let i = 0; i < index; i++) {
        if(!foundAnchor && (items[i].type === "Titre" || items[i].type === "Sous-titre")) {
          if(buildNumber(items[i], i, items) === prefix) {
            foundAnchor = true;
          }
        }
        
        if(foundAnchor && (items[i].type === "Fourniture" || items[i].type === "Main d'oeuvre" || items[i].type === "Ouvrage")) {
          itemCount++;
        }
      }
      
      return `${prefix}.${itemCount + 1}`;
    }
    
    return "";
  };

  // Ajout dynamique d'un item : TOUTES LES VALEURS PAR DEFAUT SONT VIDES, l'utilisateur peut éditer instantanément SANS SUPPRIMER DE VALEUR INITIALE
  function addItem(type: "Fourniture" | "Main d'oeuvre" | "Ouvrage" | "Titre" | "Sous-titre" | "Saut de page") {
    addQuoteItem({
      designation: "",
      quantity: undefined,
      unit: "",
      unitPrice: undefined,
      vat: undefined,
      totalHT: 0,
      type,
      level: type === "Titre" ? 1 : type === "Sous-titre" ? 2 : 3,
      isEditable: true, // Pour entrée en mode édition immédiat
    });
  }

  // Déplacement des lignes (ajout des petits boutons montée/descente)
  // Nouvelle fonction pour déplacer une ligne
  function moveItem(index: number, direction: -1 | 1) {
    if (!currentQuote?.items) return;
    const items = [...currentQuote.items];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    updateQuote({ ...currentQuote, items });
  }

  // Gestion des touches "Enter" pour valider les inputs
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>, 
    item: any, 
    field: string, 
    editField: string
  ) => {
    if (e.key === 'Enter') {
      // Mettre à jour l'item et désactiver l'édition
      const updates: any = {
        [field]: e.currentTarget.value,
        [editField]: false
      };
      
      if (field === 'quantity' || field === 'unitPrice') {
        updates[field] = parseFloat(e.currentTarget.value) || 0;
      }
      
      updateQuoteItem({ ...item, ...updates });
    }
  };

  // Table des items du devis
  const tableRows = useMemo(() => {
    if (!currentQuote?.items?.length) return null;
    
    return currentQuote.items.map((item, idx) => (
      <tr className={cn(
        "group hover:bg-gray-50",
        item.type === "Titre" ? "bg-blue-50" : "",
        item.type === "Sous-titre" ? "bg-blue-50/50" : "",
      )} key={item.id}>
        <td className="border px-4 py-2 text-center flex flex-col items-center">
          <div className="flex items-center justify-center gap-1">
            <span className="cursor-move text-gray-400">
              {/* Icon poignée */}
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="7" cy="7" r="1.5" fill="#aaa"/><circle cx="7" cy="12" r="1.5" fill="#aaa"/><circle cx="7" cy="17" r="1.5" fill="#aaa"/><circle cx="12" cy="7" r="1.5" fill="#aaa"/><circle cx="12" cy="12" r="1.5" fill="#aaa"/><circle cx="12" cy="17" r="1.5" fill="#aaa"/></svg>
            </span>
            <span className="font-medium text-gray-700">{buildNumber(item, idx, currentQuote.items)}</span>
          </div>
          <div className="flex flex-col items-center gap-1 mt-1">
            <button
              className="text-gray-400 hover:text-blue-500 p-0.5"
              disabled={idx===0}
              onClick={() => moveItem(idx, -1)}
              tabIndex={-1}
            >
              <svg width="16" height="16"><polygon points="8,4 12,10 4,10" fill="#aaa" /></svg>
            </button>
            <button
              className="text-gray-400 hover:text-blue-500 p-0.5"
              disabled={idx===currentQuote.items.length-1}
              onClick={() => moveItem(idx, 1)}
              tabIndex={-1}
            >
              <svg width="16" height="16"><polygon points="4,6 12,6 8,12" fill="#aaa" /></svg>
            </button>
          </div>
        </td>
        {/* Cellule Désignation - CLIQUABLE pour éditer directement, aucune valeur initiale imposée */}
        <td className="border px-4 py-2"
          onClick={() => updateQuoteItem({ ...item, isEditable: true })}
        >
          {item.isEditable ? (
            <Input
              autoFocus
              value={item.designation || ""}
              placeholder="Saisir..."
              className="w-full border-b border-blue-300"
              onBlur={e => { updateQuoteItem({ ...item, designation: e.target.value, isEditable: false })}}
              onChange={e => updateQuoteItem({ ...item, designation: e.target.value })}
              onKeyDown={e => handleKeyDown(e, item, 'designation', 'isEditable')}
            />
          ) : (
            <span>{item.designation || <span className="text-gray-300">Cliquer pour saisir</span>}</span>
          )}
        </td>
        {/* Quantité uniquement si pas "Titre"/"Sous-titre", editable direct */}
        <td className="border px-4 py-2 text-right"
          onClick={() => updateQuoteItem({ ...item, isEditableQty: true })}
        >
          {(item.type === "Fourniture" || item.type === "Main d'oeuvre" || item.type === "Ouvrage") ?
            item.isEditableQty ? (
              <Input
                autoFocus
                type="number"
                min={0}
                value={item.quantity || ""}
                placeholder="Qté"
                className="w-full border-b border-blue-300"
                onChange={e => updateQuoteItem({ ...item, quantity: parseFloat(e.target.value) || 0, isEditableQty:true })}
                onBlur={e => updateQuoteItem({ ...item, quantity: parseFloat(e.target.value) || 0, isEditableQty: false })}
                onKeyDown={e => handleKeyDown(e, item, 'quantity', 'isEditableQty')}
              />
            ) : (
              <span className={item.quantity ? "" : "text-gray-300"}>{item.quantity || "Qté"}</span>
            )
            : null
          }
        </td>
        {/* Unité - editable direct */}
        <td className="border px-4 py-2"
          onClick={() => updateQuoteItem({ ...item, isEditableUnit:true })}
        >
          {(item.type === "Fourniture" || item.type === "Main d'oeuvre" || item.type === "Ouvrage") ?
            item.isEditableUnit ? (
              <Input
                autoFocus
                value={item.unit || ""}
                placeholder="Unité"
                className="w-full border-b border-blue-300"
                onBlur={e => updateQuoteItem({ ...item, unit: e.target.value, isEditableUnit: false })}
                onChange={e => updateQuoteItem({ ...item, unit: e.target.value, isEditableUnit:true })}
                onKeyDown={e => handleKeyDown(e, item, 'unit', 'isEditableUnit')}
              />
            ) : (
              <span className={item.unit ? "" : "text-gray-300"}>{item.unit || "Unité"}</span>
            ) : null
          }
        </td>
        {/* Prix unitaire HT - editable direct */}
        <td className="border px-4 py-2 text-right"
          onClick={() => updateQuoteItem({ ...item, isEditablePU:true })}
        >
          {(item.type === "Fourniture" || item.type === "Main d'oeuvre" || item.type === "Ouvrage") ?
            item.isEditablePU ? (
              <Input
                autoFocus
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice || ""}
                placeholder="Prix U. HT"
                className="w-full border-b border-blue-300"
                onBlur={e => updateQuoteItem({ ...item, unitPrice: parseFloat(e.target.value) || 0, isEditablePU:false })}
                onChange={e => updateQuoteItem({ ...item, unitPrice: parseFloat(e.target.value) || 0, isEditablePU:true })}
                onKeyDown={e => handleKeyDown(e, item, 'unitPrice', 'isEditablePU')}
              />
            ) : (
              <span className={item.unitPrice ? "" : "text-gray-300"}>{item.unitPrice || "Prix U. HT"}</span>
            ) : null
          }
        </td>
        {/* TVA - editable direct */}
        <td className="border px-4 py-2 text-center"
          onClick={() => updateQuoteItem({ ...item, isEditableTVA:true })}
        >
          {(item.type === "Fourniture" || item.type === "Main d'oeuvre" || item.type === "Ouvrage") ?
            item.isEditableTVA ? (
              <Input
                autoFocus
                type="number"
                min={0}
                max={100}
                value={item.vat || ""}
                placeholder="TVA"
                className="w-full border-b border-blue-300"
                onBlur={e => updateQuoteItem({ ...item, vat: parseFloat(e.target.value) || 0, isEditableTVA:false })}
                onChange={e => updateQuoteItem({ ...item, vat: parseFloat(e.target.value) || 0, isEditableTVA:true })}
                onKeyDown={e => handleKeyDown(e, item, 'vat', 'isEditableTVA')}
              />
            ) : (
              <span className={item.vat ? "" : "text-gray-300"}>{item.vat || "TVA"}</span>
            ) : null
          }
        </td>
        {/* Total HT simple */}
        <td className="border px-4 py-2 text-right">
          <span>
            {(item.type === "Fourniture" || item.type === "Main d'oeuvre" || item.type === "Ouvrage") ?
              ((item.quantity && item.unitPrice) ? (item.quantity * item.unitPrice).toFixed(2) : "0.00")
              : ""}
            €
          </span>
        </td>
      </tr>
    ));
  }, [currentQuote?.items, updateQuoteItem]);

  // Sélection dynamique client/chantier
  function updateQuoteField(field: string, value: any) {
    if (currentQuote) {
      updateQuote({ ...currentQuote, [field]: value });
    }
  }

  // Mise à jour des conditions de paiement
  function updatePaymentConditions() {
    if (currentQuote) {
      const paymentConditions = `Acompte de ${depositPercentage} % soit ${depositAmount.toFixed(2)} € TTC\nMéthodes de paiement acceptées : Chèque, Virement bancaire, Carte bancaire`;
      updateQuote({ ...currentQuote, paymentConditions });
    }
    setShowDepositInput(false);
  }

  // Gestion du client et du projet sélectionnés
  const selectedClient = currentQuote?.clientId ? clients.find(c => c.id === currentQuote.clientId) : null;
  const selectedProject = currentQuote?.projectId ? projects.find(p => p.id === currentQuote.projectId) : null;

  // Menu header (navigation, options, save, cancel)
  const handleSave = () => {
    if (currentQuote) {
      if (description !== currentQuote.description) {
        updateQuote({ ...currentQuote, description });
      }
      updatePaymentConditions();
    }
  };

  // Fonction pour créer un nouveau client
  const createNewClient = () => {
    // Simulation d'ajout d'un client
    const newClient = {
      id: `client-${Date.now()}`,
      civility: clientTitle,
      firstName: clientFirstName,
      lastName: clientLastName,
      address: clientAddress,
      zipCode: clientPostalCode,
      city: clientCity,
      email: clientEmail,
      phone: clientPhone
    };
    
    // Reset form
    setClientTitle("M");
    setClientFirstName("");
    setClientLastName("");
    setClientAddress("");
    setClientPostalCode("");
    setClientCity("");
    setClientEmail("");
    setClientPhone("");
    
    // Close modal
    setShowClientModal(false);
    
    // Simulation: Add to clients
    // Dans une vraie app, on appellerait une fonction du contexte comme addClient(newClient)
    alert("Le client serait ajouté ici (simulation)");
  };

  // Fonction pour créer un nouveau projet
  const createNewProject = () => {
    if (!selectedClient) {
      alert("Veuillez d'abord sélectionner un client");
      return;
    }
    
    // Simulation d'ajout d'un projet
    const newProject = {
      id: `project-${Date.now()}`,
      name: projectName,
      description: projectNotes,
      client: selectedClient.id,
      differentAddress: projectDifferentAddress,
    };
    
    // Reset form
    setProjectName("");
    setProjectNotes("");
    setProjectDifferentAddress(false);
    
    // Close modal
    setShowProjectModal(false);
    
    // Simulation: Add to projects
    // Dans une vraie app, on appellerait une fonction du contexte comme addProject(newProject)
    alert("Le projet serait ajouté ici (simulation)");
  };

  // Format du numéro de devis
  const generateQuoteNumber = () => {
    const yearMonth = dateFormat === "year+month" 
      ? `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}` 
      : new Date().getFullYear().toString();
    
    const paddedNumber = currentNumber.padStart(parseInt(numberLength), '0');
    
    return `${numberPrefix}${numberSeparator}${yearMonth}${numberSeparator}${paddedNumber}`;
  };

  // Mise à jour de la période de validité
  const updateValidityPeriod = () => {
    const today = new Date();
    let futureDate = new Date();
    
    if (validityPeriod === "15 Jours") {
      futureDate.setDate(today.getDate() + 15);
    } else if (validityPeriod === "30 Jours") {
      futureDate.setDate(today.getDate() + 30);
    } else if (validityPeriod === "45 Jours") {
      futureDate.setDate(today.getDate() + 45);
    } else if (validityPeriod === "60 Jours") {
      futureDate.setDate(today.getDate() + 60);
    } else if (validityPeriod === "90 Jours") {
      futureDate.setDate(today.getDate() + 90);
    }
    
    setValidUntil(futureDate.toLocaleDateString('fr-FR'));
    setShowValidityModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Barre Nav - Une seule barre au lieu de deux */}
      <header className="flex items-center justify-between border-b bg-white px-4 py-2 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-medium">Nouveau devis</h1>
          <div className="h-8 border-r" />
          <Button 
            variant={mode === "edit" ? "default" : "ghost"} 
            size="sm" 
            className={mode === "edit" ? "text-blue-500 bg-blue-50" : "text-gray-500"} 
            onClick={() => setMode("edit")}
          >
            <Edit className="h-4 w-4 mr-1" />
            <span>Édition</span>
          </Button>
          <Button 
            variant={mode === "preview" ? "default" : "ghost"} 
            size="sm" 
            className={mode === "preview" ? "text-blue-500 bg-blue-50" : "text-gray-500"}
            onClick={() => setMode("preview")}
          >
            <Eye className="h-4 w-4 mr-1" />
            <span>Prévisualisation</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button variant="outline" size="sm">
              Options <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            Annuler
          </Button>
          <Button variant="blue" size="sm" onClick={handleSave}>
            Enregistrer
          </Button>
          <Button variant="blue" size="sm" className="bg-green-500 text-white hover:bg-green-600">
            Finaliser et envoyer <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setCurrentQuote(null); navigate("/"); }}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Contenu principal */}
        <main className="flex-1 overflow-auto p-6">
          {/* Bloc devis */}
          <div className="bg-white p-6 rounded-md border shadow-sm">
            {/* En-tête devis */}
            <div className="flex justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Devis n°{currentQuote?.number || generateQuoteNumber()}</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-6 w-6"
                    onClick={() => setShowNumberFormatModal(true)}
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">En date du {formatDate(currentQuote?.date) || quoteDate}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">Valable jusqu'au {formatDate(currentQuote?.validUntil) || validUntil}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-6 w-6"
                    onClick={() => setShowValidityModal(true)}
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 w-80">
                <Popover open={showClientDropdown} onOpenChange={setShowClientDropdown}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setShowClientDropdown(true)}
                    >
                      {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : "Sélectionner un client"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 z-50 bg-white" align="end">
                    <div className="p-2">
                      <Input placeholder="Rechercher..." className="mb-2" />
                      <div className="max-h-[200px] overflow-y-auto">
                        {clients.map((client) => (
                          <div
                            key={client.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                            onClick={() => {
                              updateQuoteField("clientId", client.id);
                              setShowClientDropdown(false);
                            }}
                          >
                            {client.firstName} {client.lastName}
                          </div>
                        ))}
                      </div>
                      <Button
                        className="w-full mt-2 bg-blue-500 text-white hover:bg-blue-600"
                        onClick={() => {
                          setShowClientDropdown(false);
                          setShowClientModal(true);
                        }}
                      >
                        Nouveau client
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover open={showProjectDropdown} onOpenChange={setShowProjectDropdown}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setShowProjectDropdown(true)}
                    >
                      {selectedProject ? selectedProject.name : "Sélectionner un chantier"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 z-50 bg-white" align="end">
                    <div className="p-2">
                      <Input placeholder="Rechercher..." className="mb-2" />
                      <div className="max-h-[200px] overflow-y-auto">
                        {selectedClient &&
                          projects
                            .filter((project) => project.client === selectedClient.id)
                            .map((project) => (
                              <div
                                key={project.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                onClick={() => {
                                  updateQuoteField("projectId", project.id);
                                  setShowProjectDropdown(false);
                                }}
                              >
                                {project.name}
                              </div>
                            ))}
                        {(!selectedClient ||
                          projects.filter((project) => selectedClient && project.client === selectedClient.id)
                            .length === 0) && <div className="p-2 text-gray-500">Aucun résultat trouvé</div>}
                      </div>
                      <Button
                        className="w-full mt-2 bg-blue-500 text-white hover:bg-blue-600"
                        onClick={() => {
                          setShowProjectDropdown(false);
                          setShowProjectModal(true);
                        }}
                      >
                        Nouveau chantier
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Client et informations projet */}
            {selectedClient && (
              <div className="mb-4 text-right">
                <p className="font-medium">
                  {selectedClient.civility} {selectedClient.firstName} {selectedClient.lastName}
                </p>
                <p>{selectedClient.address}</p>
                <p>
                  {selectedClient.zipCode} {selectedClient.city}
                </p>
              </div>
            )}

            {selectedProject && (
              <div className="mb-4">
                <p className="font-medium">{selectedProject.name}</p>
                <p className="text-sm text-gray-600">{selectedProject.description}</p>
              </div>
            )}

            {/* Ajout description */}
            {!showDescription ? (
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 flex items-center"
                  onClick={() => setShowDescription(true)}
                >
                  <CirclePlus className="h-4 w-4 mr-1" />
                  Ajouter une description
                </Button>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 flex items-center"
                    onClick={() => setShowDescription(false)}
                  >
                    Masquer la description
                  </Button>
                </div>
                {mode === "edit" ? (
                  <Textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full my-2"
                    onBlur={() => currentQuote && updateQuote({ ...currentQuote, description })}
                  />
                ) : (
                  <div className="whitespace-pre-line bg-gray-50 rounded p-3 border">{description}</div>
                )}
              </div>
            )}

            {/* Table des items */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="border px-4 py-2 text-left w-16">N°</th>
                    <th className="border px-4 py-2 text-left">Désignation</th>
                    <th className="border px-4 py-2 text-right w-24">Qté</th>
                    <th className="border px-4 py-2 text-left w-24">Unité</th>
                    <th className="border px-4 py-2 text-right w-28">Prix U. HT</th>
                    <th className="border px-4 py-2 text-center w-24">TVA</th>
                    <th className="border px-4 py-2 text-right w-28">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows && tableRows.length > 0 ? tableRows : (
                    <tr className="bg-white h-16">
                      <td colSpan={7} className="border px-4 py-8 text-center text-gray-500">
                        Cliquez sur un des boutons ci-dessous pour ajouter un élément à votre document
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Ajout rapide d'item */}
            <div className="flex mb-6 justify-between">
              <div className="space-x-2">
                <Button variant="outline" size="sm" className="text-blue-500" onClick={() => addItem("Fourniture")}>
                  <Plus className="h-4 w-4 mr-1" /> Fourniture
                </Button>
                <Button variant="outline" size="sm" className="text-blue-500" onClick={() => addItem("Main d'oeuvre")}>
                  <Plus className="h-4 w-4 mr-1" /> Main d'oeuvre
                </Button>
                <Button variant="outline" size="sm" className="text-blue-500" onClick={() => addItem("Ouvrage")}>
                  <Plus className="h-4 w-4 mr-1" /> Ouvrage
                </Button>
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => addItem("Titre")}>
                  Titre
                </Button>
                <Button variant="outline" size="sm" onClick={() => addItem("Sous-titre")}>
                  Sous-titre
                </Button>
                <Button variant="outline" size="sm" onClick={() => addItem("Saut de page")}>
                  Saut de page
                </Button>
              </div>
            </div>

            <div className="text-right mb-4">
              {!showDiscount ? (
                <Button variant="ghost" size="sm" className="text-blue-500" onClick={() => setShowDiscount(true)}>
                  <CirclePlus className="h-4 w-4 mr-1" /> Ajouter une remise
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-blue-500" onClick={() => setShowDiscount(false)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer la remise
                </Button>
              )}
            </div>

            {/* Paiement/total */}
            <div className="flex justify-between mb-6">
              <div className="w-1/2">
                <h3 className="text-lg font-medium mb-2">Conditions de paiement</h3>
                {!showDepositInput ? (
                  <p className="text-sm mb-2">
                    Acompte de {depositPercentage} % soit {depositAmount.toFixed(2)} € TTC
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 p-0 h-6 w-6"
                      onClick={() => setShowDepositInput(true)}
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                  </p>
                ) : (
                  <div className="flex items-center mb-2 gap-2">
                    <span className="text-sm">Acompte de</span>
                    <Input
                      type="number"
                      value={depositPercentage}
                      onChange={(e) => setDepositPercentage(parseInt(e.target.value) || 0)}
                      className="w-16 h-8"
                    />
                    <span className="text-sm">%</span>
                    <span className="text-sm">({depositAmount.toFixed(2)} € TTC)</span>
                    <Button
                      size="sm"
                      className="bg-blue-500 text-white hover:bg-blue-600"
                      onClick={updatePaymentConditions}
                    >
                      Valider
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowDepositInput(false)}>
                      Annuler
                    </Button>
                  </div>
                )}
                <p className="text-sm mb-2">Méthodes de paiement acceptées : Chèque, Virement bancaire, Carte bancaire</p>
                <Button variant="ghost" size="sm" className="text-blue-500 p-0 h-auto">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter texte libre
                </Button>
              </div>
              <div className="w-1/3">
                <div className="bg-gray-50 p-4 rounded border">
                  <div className="flex justify-between mb-2">
                    <span>Total net HT</span>
                    <span>{formatCurrency(subtotalHT)}</span>
                  </div>

                  {showDiscount && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span>Remise globale</span>
                        <div className="flex items-center">
                          <Input
                            type="number"
                            value={globalDiscount}
                            onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                            className="w-20 h-8 mr-2"
                          />
                          <Select
                            value={discountType}
                            onValueChange={(value) => setDiscountType(value as "percentage" | "amount")}
                          >
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">%</SelectItem>
                              <SelectItem value="amount">€ HT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Remise HT</span>
                        <span>{formatCurrency(discountType === "percentage" ? subtotalHT * globalDiscount / 100 : globalDiscount)}</span>
                      </div>
                    </>
                  )}

                  {tvaTotals.map((tva, index) => (
                    <div key={index} className="flex justify-between mb-2">
                      <span>TVA {tva.rate} %</span>
                      <span>{tva.amount.toFixed(2)} €</span>
                    </div>
                  ))}

                  <div className="flex justify-between font-bold text-white bg-blue-500 p-2 rounded">
                    <span>NET À PAYER</span>
                    <span>{formatCurrency(totalTTC)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bas de page */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Notes de bas de page</h3>
              <Textarea
                className="w-full h-24 border rounded"
                value={currentQuote?.footer || ""}
                onChange={e => updateQuote({ ...currentQuote!, footer: e.target.value })}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Client Modal */}
      <Dialog open={showClientModal} onOpenChange={setShowClientModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau client</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Statut</h3>
              <div className="flex">
                <Button
                  type="button"
                  variant={clientType === "particulier" ? "default" : "outline"}
                  className={clientType === "particulier" ? "rounded-r-none bg-blue-500 text-white" : "rounded-r-none"}
                  onClick={() => setClientType("particulier")}
                >
                  Particulier
                </Button>
                <Button
                  type="button"
                  variant={clientType === "professionnel" ? "default" : "outline"}
                  className={
                    clientType === "professionnel" ? "rounded-l-none bg-blue-500 text-white" : "rounded-l-none"
                  }
                  onClick={() => setClientType("professionnel")}
                >
                  Professionnel
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Civilité</h3>
                <div className="flex">
                  <Button
                    type="button"
                    variant={clientTitle === "M" ? "default" : "outline"}
                    className={clientTitle === "M" ? "rounded-r-none bg-blue-500 text-white" : "rounded-r-none"}
                    onClick={() => setClientTitle("M")}
                  >
                    M
                  </Button>
                  <Button
                    type="button"
                    variant={clientTitle === "Mme" ? "default" : "outline"}
                    className={
                      clientTitle === "Mme"
                        ? "rounded-l-none rounded-r-none bg-blue-500 text-white"
                        : "rounded-l-none rounded-r-none"
                    }
                    onClick={() => setClientTitle("Mme")}
                  >
                    Mme
                  </Button>
                  <Button
                    type="button"
                    variant={clientTitle === "M et Mme" ? "default" : "outline"}
                    className={clientTitle === "M et Mme" ? "rounded-l-none bg-blue-500 text-white" : "rounded-l-none"}
                    onClick={() => setClientTitle("M et Mme")}
                  >
                    M et Mme
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Nom *</h3>
                <Input value={clientLastName} onChange={(e) => setClientLastName(e.target.value)} />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Prénom</h3>
                <Input value={clientFirstName} onChange={(e) => setClientFirstName(e.target.value)} />
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Adresse</h3>
              <Input
                className="mb-2"
                placeholder="Rue et numéro de rue"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
              />
              <Input
                className="mb-2"
                placeholder="Complément d'adresse (Bât, Appt...)"
                value={clientAddressComplement}
                onChange={(e) => setClientAddressComplement(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4 mb-2">
                <Input
                  placeholder="Code postal"
                  value={clientPostalCode}
                  onChange={(e) => setClientPostalCode(e.target.value)}
                />
                <Input placeholder="Ville" value={clientCity} onChange={(e) => setClientCity(e.target.value)} />
              </div>

              <Select value={clientCountry} onValueChange={setClientCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Belgique">Belgique</SelectItem>
                  <SelectItem value="Suisse">Suisse</SelectItem>
                  <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Adresse email</h3>
                <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Téléphone</h3>
                <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClientModal(false)}>
              Annuler
            </Button>
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={createNewClient}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Modal */}
      <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau chantier</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Client</h3>
              <Input 
                value={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : ""} 
                disabled 
              />
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Nom du chantier *</h3>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Rénovation du restaurant rue"
              />
            </div>

            <div className="mb-4 flex items-center">
              <Checkbox
                id="different-address"
                checked={projectDifferentAddress}
                onCheckedChange={(checked) => setProjectDifferentAddress(checked as boolean)}
              />
              <label
                htmlFor="different-address"
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Le chantier est à une adresse différente de celle du client
              </label>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Notes</h3>
              <Textarea value={projectNotes} onChange={(e) => setProjectNotes(e.target.value)} className="h-32" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProjectModal(false)}>
              Annuler
            </Button>
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={createNewProject}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Number Format Modal */}
      <Dialog open={showNumberFormatModal} onOpenChange={setShowNumberFormatModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Format du numéro de devis</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Préfixe</h3>
              <Input value={numberPrefix} onChange={(e) => setNumberPrefix(e.target.value)} placeholder="DEV" />
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Séparateur</h3>
              <RadioGroup value={numberSeparator} onValueChange={setNumberSeparator} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="-" id="separator-dash" />
                  <Label htmlFor="separator-dash">-</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="/" id="separator-slash" />
                  <Label htmlFor="separator-slash">/</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="separator-none" />
                  <Label htmlFor="separator-none">Aucun</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Format de la date</h3>
              <RadioGroup value={dateFormat} onValueChange={setDateFormat} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="year" id="date-year" />
                  <Label htmlFor="date-year">Année</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="year+month" id="date-year-month" />
                  <Label htmlFor="date-year-month">Année + Mois</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Longueur de numérotation</h3>
              <RadioGroup value={numberLength} onValueChange={setNumberLength} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="length-3" />
                  <Label htmlFor="length-3">3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="length-4" />
                  <Label htmlFor="length-4">4</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="length-5" />
                  <Label htmlFor="length-5">5</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6" id="length-6" />
                  <Label htmlFor="length-6">6</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Numéro courant</h3>
              <Input value={currentNumber} onChange={(e) => setCurrentNumber(e.target.value)} type="number" />
            </div>

            <div className="p-4 border rounded-md bg-gray-50 text-center">
              <p className="text-xl font-medium">
                {numberPrefix}
                {numberSeparator}
                {dateFormat === "year" ? "2025" : "202504"}
                {numberSeparator}
                {currentNumber.padStart(parseInt(numberLength), "0")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNumberFormatModal(false)}>
              Annuler
            </Button>
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setShowNumberFormatModal(false)}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validity Period Modal */}
      <Dialog open={showValidityModal} onOpenChange={setShowValidityModal}>
        <DialogContent className="max-w-md">
          <div className="py-4">
            <Select value={validityPeriod} onValueChange={setValidityPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Durée de validité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15 Jours">15 Jours</SelectItem>
                <SelectItem value="30 Jours">30 Jours</SelectItem>
                <SelectItem value="45 Jours">45 Jours</SelectItem>
                <SelectItem value="60 Jours">60 Jours</SelectItem>
                <SelectItem value="90 Jours">90 Jours</SelectItem>
                <SelectItem value="custom">Date personnalisée</SelectItem>
              </SelectContent>
            </Select>

            {validityPeriod === "custom" && <Input type="date" className="mt-2" />}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValidityModal(false)}>
              Annuler
            </Button>
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={updateValidityPeriod}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


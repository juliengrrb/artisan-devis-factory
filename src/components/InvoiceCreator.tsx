
import React, { useMemo, useEffect, useState } from "react";
import { 
  AlertTriangle, 
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

  // Table des items du devis
  const tableRows = useMemo(() => {
    if (!currentQuote?.items?.length) return null;
    
    return currentQuote.items.map((item, idx) => (
      <React.Fragment key={item.id}>
        <tr className={cn(
          "group hover:bg-gray-50",
          item.level === 1 ? "bg-blue-50" : "",
          item.level === 2 ? "bg-blue-50/50" : "",
        )}>
          <td className="border px-4 py-2 text-center">
            <div className="flex items-center justify-center">
              {item.level < 3 && (
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <ChevronDown className="h-3 w-3" />
                </Button>
              )}
              <span>{idx + 1}</span>
            </div>
          </td>
          <td className="border px-4 py-2" style={{ paddingLeft: `${(item.level || 0) * 16 + 16}px` }}>
            {mode === "edit" ? (
              <input
                value={item.designation}
                onChange={e => updateQuoteItem({ ...item, designation: e.target.value })}
                className="w-full border-none bg-transparent"
                placeholder="Désignation"
              />
            ) : item.designation}
          </td>
          <td className="border px-4 py-2 text-right">
            {item.level === 3 ? (
              mode === "edit" ? (
                <Input
                  type="number"
                  min="0"
                  value={item.quantity ?? ""}
                  onChange={e => updateQuoteItem({ ...item, quantity: parseFloat(e.target.value) || 0 })}
                  className="h-8 w-full text-right border-none bg-transparent"
                  placeholder="0"
                />
              ) : item.quantity
            ) : null}
          </td>
          <td className="border px-4 py-2">
            {item.level === 3 ? (
              mode === "edit" ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between h-8">
                      {item.unit || "Unité"}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0">
                    <div className="max-h-[200px] overflow-y-auto">
                      {["u", "h", "m", "m²", "m³"].map((unit) => (
                        <div
                          key={unit}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => updateQuoteItem({ ...item, unit })}
                        >
                          {unit}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : item.unit
            ) : null}
          </td>
          <td className="border px-4 py-2 text-right">
            {item.level === 3 ? (
              mode === "edit" ? (
                <Input
                  type="number"
                  min="0"
                  value={item.unitPrice ?? ""}
                  onChange={e => updateQuoteItem({ ...item, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="h-8 w-full text-right border-none bg-transparent"
                  placeholder="0,00"
                />
              ) : formatCurrency(item.unitPrice)
            ) : null}
          </td>
          <td className="border px-4 py-2 text-center">
            {item.level === 3 ? (
              mode === "edit" ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between h-8">
                      {item.vat}%
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0">
                    <div className="max-h-[200px] overflow-y-auto">
                      {[0, 5.5, 10, 20].map((rate) => (
                        <div
                          key={rate}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => updateQuoteItem({ ...item, vat: rate })}
                        >
                          {rate}%
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : `${item.vat}%`
            ) : null}
          </td>
          <td className="border px-4 py-2 text-right">
            <div className="flex items-center justify-end">
              <span>{formatCurrency(item.totalHT)}</span>
              {mode === "edit" && item.level === 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-1 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteQuoteItem(item.id!)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          </td>
        </tr>
        {item.details && (
          <tr className="bg-gray-50">
            <td className="border px-4 py-2"></td>
            <td className="border px-4 py-2" colSpan={6}>
              <div className="text-sm text-gray-600">{item.details}</div>
              {mode === "edit" && (
                <Button variant="outline" size="sm" className="mt-2 text-blue-500 bg-white">
                  <Settings className="h-4 w-4 mr-1" /> Configurer les éléments
                </Button>
              )}
            </td>
          </tr>
        )}
      </React.Fragment>
    ));
  }, [currentQuote?.items, mode, updateQuoteItem, deleteQuoteItem]);

  // Ajout dynamique d'un item
  function addItem(type: "Fourniture" | "Main d'oeuvre" | "Ouvrage" | "Titre" | "Sous-titre" | "Texte" | "Saut de page") {
    addQuoteItem({
      designation: type === "Titre" || type === "Sous-titre" ? "Nouvelle section" : "",
      quantity: type === "Fourniture" || type === "Main d'oeuvre" || type === "Ouvrage" ? 1 : 0,
      unit: "m²",
      unitPrice: 0,
      vat: 20,
      totalHT: 0,
      type,
      level: type === "Titre" ? 1 : type === "Sous-titre" ? 2 : 3,
    });
  }

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
      {/* Top Barre Nav */}
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
        {/* Sidebar gauche */}
        <aside className="w-48 border-r bg-white p-4 shrink-0">
          <h2 className="mb-4 text-sm font-medium">Bibliothèque</h2>
          <Button className="w-full bg-lime-500 hover:bg-lime-600 text-white">Cliquez-ici</Button>
        </aside>
        {/* Contenu principal */}
        <main className="flex-1 overflow-auto p-6">
          {/* Message warning */}
          <div className="mb-6 rounded-md bg-yellow-50 p-4 border-l-4 border-yellow-400">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <p className="ml-3 text-sm text-yellow-800">
                Certaines mentions légales obligatoires sur vos documents ne sont pas renseignées (5 manquantes).{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  Configurer maintenant
                </a>
                .
              </p>
            </div>
          </div>
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
                <Button variant="outline" size="sm" onClick={() => addItem("Texte")}>
                  Texte
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

                <h3 className="text-lg font-medium mt-4 mb-2">
                  Gestion des déchets{" "}
                  <Button variant="ghost" size="sm" className="text-blue-500 p-0 h-auto">
                    Définir
                  </Button>
                </h3>
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

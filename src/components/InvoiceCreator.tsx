
import React, { useMemo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Edit, Eye, Plus, X } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";

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
  // Description additionnelle, footer, warning, etc.
  const [showDescription, setShowDescription] = useState<boolean>(false);

  // On permet d'éditer la description (petit état local sinon on override tout le quote)
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (currentQuote?.description) setDescription(currentQuote.description);
  }, [currentQuote?.description]);

  // Utilitaires pour l'affichage
  const formatDate = (date?: string | Date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR");
  };
  const formatCurrency = (n?: number) => (n ? n.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €" : "0,00 €");

  // Table des items du devis
  const tableRows = useMemo(
    () =>
      currentQuote?.items?.length
        ? currentQuote.items.map((item, idx) => (
            <tr key={item.id} className="border-b">
              <td className="border px-4 py-2">{idx + 1}</td>
              <td className="border px-4 py-2">{mode === "edit" ? (
                <input
                  value={item.designation}
                  onChange={e => updateQuoteItem({ ...item, designation: e.target.value })}
                  className="w-full border-none bg-transparent"
                  placeholder="Désignation"
                />
              ) : item.designation}</td>
              <td className="border px-4 py-2 text-right">{mode === "edit" ? (
                <input
                  type="number"
                  style={{ width: "60px" }}
                  min="0"
                  value={item.quantity ?? ""}
                  onChange={e => updateQuoteItem({ ...item, quantity: parseFloat(e.target.value) || 0 })}
                  className="text-right border-none bg-transparent"
                  placeholder="0"
                />
              ) : item.quantity}</td>
              <td className="border px-4 py-2">{mode === "edit" ? (
                <input
                  value={item.unit || ""}
                  onChange={e => updateQuoteItem({ ...item, unit: e.target.value })}
                  className="text-center border-none bg-transparent"
                  style={{ width: "60px" }}
                  placeholder="Unité"
                />
              ) : item.unit}</td>
              <td className="border px-4 py-2 text-right">{mode === "edit" ? (
                <input
                  type="number"
                  value={item.unitPrice ?? ""}
                  style={{ width: "70px" }}
                  min="0"
                  onChange={e => updateQuoteItem({ ...item, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="text-right border-none bg-transparent"
                  placeholder="0,00"
                />
              ) : formatCurrency(item.unitPrice)}</td>
              <td className="border px-4 py-2 text-right">{formatCurrency(item.totalHT)}</td>
              {mode === "edit" && (
                <td className="border px-2 py-2">
                  <Button variant="ghost" size="sm" onClick={() => deleteQuoteItem(item.id!)}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              )}
            </tr>
          ))
        : null,
    [currentQuote?.items, mode, updateQuoteItem, deleteQuoteItem]
  );

  // Ajout dynamique d'un item
  function addItem(type: string) {
    addQuoteItem({
      designation: type === "Section" ? "Nouvelle section" : "",
      quantity: type === "Fourniture" || type === "Main d'oeuvre" || type === "Ouvrage" ? 1 : 0,
      unit: "m²",
      unitPrice: 0,
      vat: 20,
      totalHT: 0,
      type,
      level: type === "Section" ? 1 : 3,
      // parentId: à gérer si structure...
    });
  }

  // Sélection dynamique client/chantier
  function updateQuoteField(field: string, value: any) {
    if (currentQuote) {
      updateQuote({ ...currentQuote, [field]: value });
    }
  }

  // Menu header (navigation, options, save, cancel)
  const handleSave = () => {
    // Déjà persisté en temps réel dans updateQuote
    // On peut forcer un save manuel ou show toast, etc
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Barre Nav */}
      <header className="flex items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-medium">Nouveau devis</h1>
          <div className="h-8 border-r" />
          <Button variant={mode === "edit" ? "ghost" : "outline"} size="sm" className="text-blue-500 flex items-center gap-1" onClick={() => setMode("edit")}>
            <Edit className="h-4 w-4" />
            <span>Édition</span>
          </Button>
          <Button variant={mode === "preview" ? "ghost" : "outline"} size="sm" className="flex items-center gap-1" onClick={() => setMode("preview")}>
            <Eye className="h-4 w-4" />
            <span>Prévisualisation</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button variant="outline" size="sm">
              Options <span className="ml-1">▼</span>
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleSave}>
            Enregistrer
          </Button>
          <Button variant="success" size="sm" className="bg-green-500 text-white hover:bg-green-600">
            Finaliser et envoyer <span className="ml-1">▼</span>
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
          <div className="bg-white p-6 rounded-md border">
            {/* En-tête devis */}
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Devis n°{currentQuote?.number || ""}</h2>
                <p className="text-sm text-gray-600">En date du {formatDate(currentQuote?.date)}</p>
                <p className="text-sm text-gray-600">Valable jusqu&apos;au {formatDate(currentQuote?.validUntil)}</p>
                <p className="text-sm text-gray-600">
                  Début des travaux le{" "}
                  <a href="#" className="text-blue-500">
                    définir
                  </a>
                </p>
                <p className="text-sm text-gray-600">
                  Durée estimée à{" "}
                  <a href="#" className="text-blue-500">
                    définir
                  </a>
                </p>
              </div>
              <div className="space-y-2 w-80">
                <Select value={currentQuote?.clientId} onValueChange={v => updateQuoteField("clientId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem value={client.id} key={client.id}>{client.firstName} {client.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={currentQuote?.projectId} onValueChange={v => updateQuoteField("projectId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un chantier" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Ajout description */}
            <div className="mb-4">
              {mode === "edit" && (
                <Button variant="ghost" size="sm" className="text-blue-500" onClick={() => setShowDescription(d => !d)}>
                  <Plus className="h-4 w-4 mr-1" />{" "}
                  {showDescription ? "Cacher la description" : "Ajouter une description"}
                </Button>
              )}
              {showDescription && (
                <Textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full my-2"
                  onBlur={() => currentQuote && updateQuote({ ...currentQuote, description })}
                />
              )}
              {(mode === "preview" && currentQuote?.description) && (
                <div className="text-sm text-gray-700 bg-gray-50 rounded p-2 mb-2">
                  {currentQuote.description}
                </div>
              )}
            </div>
            {/* Table des items */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="border px-4 py-2 text-left">N°</th>
                    <th className="border px-4 py-2 text-left">Désignation</th>
                    <th className="border px-4 py-2 text-right">Qté</th>
                    <th className="border px-4 py-2 text-left">Unité</th>
                    <th className="border px-4 py-2 text-right">Prix U. HT</th>
                    <th className="border px-4 py-2 text-right">Total HT</th>
                    {mode === "edit" && <th className="border px-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {tableRows && tableRows.length > 0 ? tableRows : (
                    <tr className="bg-white h-16">
                      <td colSpan={mode === "edit" ? 7 : 6} className="py-6 text-center text-gray-500">
                        Cliquez sur un des boutons ci-dessous pour ajouter un élément à votre document
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Ajout rapide d'item */}
            <div className="flex mb-6 space-x-2">
              <Button variant="outline" size="sm" className="text-blue-500" onClick={() => addItem("Fourniture")}>
                <Plus className="h-4 w-4 mr-1" /> Fourniture
              </Button>
              <Button variant="outline" size="sm" className="text-blue-500" onClick={() => addItem("Main d'oeuvre")}>
                <Plus className="h-4 w-4 mr-1" /> Main d'oeuvre
              </Button>
              <Button variant="outline" size="sm" className="text-blue-500" onClick={() => addItem("Ouvrage")}>
                <Plus className="h-4 w-4 mr-1" /> Ouvrage
              </Button>
              <Button variant="outline" size="sm" className="text-blue-500" onClick={() => addItem("Section")}>
                Section
              </Button>
              <div className="ml-auto space-x-2">
                <Button variant="outline" size="sm" onClick={() => addItem("Texte")}>
                  Texte
                </Button>
                <Button variant="outline" size="sm" onClick={() => addItem("Saut de page")}>
                  Saut de page
                </Button>
              </div>
            </div>
            {/* Paiement/total */}
            <div className="flex justify-between mb-6">
              <div className="w-1/2">
                <h3 className="text-lg font-medium mb-2">
                  Conditions de paiement{" "}
                  <Button variant="ghost" size="sm" className="text-blue-500 p-0 h-auto">
                    <Plus className="h-4 w-4 mr-1" /> Ajouter une condition
                  </Button>
                </h3>
                <p className="text-sm mb-2">Méthodes de paiement acceptées : Chèque, Espèces</p>
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
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between mb-2">
                    <span>Total net HT</span>
                    <span>{formatCurrency(currentQuote?.totalHT)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white bg-blue-500 p-2 rounded">
                    <span>NET À PAYER</span>
                    <span>{formatCurrency(currentQuote?.totalTTC)}</span>
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
    </div>
  );
}

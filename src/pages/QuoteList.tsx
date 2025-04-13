import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Plus, FileText, ExternalLink, Copy, Trash, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function QuoteList() {
  const { quotes, clients, projects, createQuote, deleteQuote, setCurrentQuote } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateQuote = () => {
    const newQuote = createQuote();
    setCurrentQuote(newQuote);
    navigate("/devis");
  };

  const handleEditQuote = (quote: Quote) => {
    setCurrentQuote(quote);
    navigate(`/devis/${quote.id}`);
  };

  const handleDuplicateQuote = (id: string) => {
    const quote = quotes.find(q => q.id === id);
    if (quote) {
      const newQuote = {
        ...quote,
        id: Date.now().toString(),
        number: `${quote.number}-COPIE`,
        date: new Date().toISOString().split("T")[0]
      };
      setCurrentQuote(newQuote);
      navigate("/devis");
      toast.success("Devis dupliqué avec succès");
    }
  };

  const handleDeleteQuote = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce devis ?")) {
      deleteQuote(id);
      toast.success("Devis supprimé avec succès");
    }
  };

  const filteredQuotes = quotes.filter(quote => 
    quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clients.find(c => c.id === quote.clientId)?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    projects.find(p => p.id === quote.projectId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientName = (clientId?: string) => {
    if (!clientId) return "Client non spécifié";
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : "Client inconnu";
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return "Projet non spécifié";
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Projet inconnu";
  };

  const getStatusColor = (validUntil: string) => {
    const today = new Date();
    const validDate = new Date(validUntil);
    
    if (validDate < today) {
      return "bg-red-100 text-red-800"; // Expiré
    }
    
    const diffTime = validDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return "bg-yellow-100 text-yellow-800"; // Expire bientôt
    }
    
    return "bg-green-100 text-green-800"; // Valide
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Devis</h1>
        <Button 
          className="bg-devis-blue hover:bg-blue-700 text-white"
          onClick={handleCreateQuote}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau devis
        </Button>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-md shadow overflow-hidden">
          <div className="p-4 border-b">
            <input 
              type="text" 
              placeholder="Rechercher un devis..." 
              className="w-full p-2 border border-gray-300 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro de devis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client / Projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total TTC
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {quote.number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">
                        {getClientName(quote.clientId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getProjectName(quote.projectId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        Créé le {new Date(quote.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        Valide jusqu'au {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(quote.validUntil)}`}>
                        {new Date(quote.validUntil) < new Date() ? "Expiré" : "Valide"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quote.totalTTC.toFixed(2)} €
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600"
                          onClick={() => handleEditQuote(quote)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-amber-600"
                          onClick={() => handleDuplicateQuote(quote.id)}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Dupliquer</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleDeleteQuote(quote.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Aucun devis trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

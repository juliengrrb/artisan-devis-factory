
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { ClientForm } from "@/components/ClientForm";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mail, FileText, Trash, Pencil } from "lucide-react";
import { Client } from "@/types";
import { toast } from "sonner";

export default function ClientList() {
  const { clients, deleteClient } = useAppContext();
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      deleteClient(id);
      toast.success("Client supprimé avec succès");
    }
  };

  const filteredClients = clients.filter(client => 
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Button 
          className="bg-devis-blue hover:bg-blue-700 text-white"
          onClick={() => {
            setEditingClient(undefined);
            setShowClientForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-md shadow overflow-hidden">
          <div className="p-4 border-b">
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
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
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-800 font-semibold">
                            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {client.civility} {client.firstName} {client.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.email && (
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-1 text-gray-400" />
                          {client.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {client.address}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.zipCode} {client.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" className="text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Créer devis</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600"
                          onClick={() => handleEditClient(client)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Aucun client trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {showClientForm && (
        <ClientForm 
          client={editingClient}
          onClose={() => {
            setShowClientForm(false);
            setEditingClient(undefined);
          }} 
        />
      )}
    </div>
  );
}

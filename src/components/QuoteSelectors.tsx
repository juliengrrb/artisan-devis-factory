
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { ChevronDown, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ClientForm } from "./ClientForm";
import { Input } from "@/components/ui/input";

interface QuoteSelectorsProps {
  onClientSelect: (clientId: string) => void;
  onProjectSelect: (projectId: string) => void;
  selectedClientId?: string;
  selectedProjectId?: string;
}

export function QuoteSelectors({
  onClientSelect,
  onProjectSelect,
  selectedClientId,
  selectedProjectId,
}: QuoteSelectorsProps) {
  const { clients, projects } = useAppContext();
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const filteredClients = clientSearch 
    ? clients.filter(client => 
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(clientSearch.toLowerCase())
      )
    : clients;

  const clientProjects = selectedClientId 
    ? projects.filter(project => project.clientId === selectedClientId)
    : [];

  return (
    <div className="space-y-4 w-full max-w-sm bg-white p-4 rounded-md shadow-sm">
      <div className="space-y-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox" 
              className="w-full justify-between text-gray-500"
            >
              {selectedClientId 
                ? clients.find(c => c.id === selectedClientId)
                  ? `${clients.find(c => c.id === selectedClientId)?.firstName} ${clients.find(c => c.id === selectedClientId)?.lastName}`
                  : "Sélectionner un client"
                : "Sélectionner un client"
              }
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <div className="p-2 border-b">
              <Input
                placeholder="Rechercher un client..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredClients.length > 0 ? (
                <div className="w-full">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        onClientSelect(client.id);
                        document.body.click(); // Close the popover
                      }}
                    >
                      {client.firstName} {client.lastName}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm p-4 text-center text-gray-500">
                  Aucun client trouvé
                </div>
              )}
            </div>
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-t-none"
              onClick={() => setShowClientForm(true)}
            >
              Nouveau client
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Select 
          value={selectedProjectId} 
          onValueChange={onProjectSelect}
          disabled={!selectedClientId || clientProjects.length === 0}
        >
          <SelectTrigger className="w-full text-gray-500">
            <SelectValue placeholder="Sélectionner un chantier" />
          </SelectTrigger>
          <SelectContent>
            {clientProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 border-t mt-4">
        <div className="flex justify-between text-sm">
          <span>Total net HT</span>
          <span className="font-medium">0,00 €</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span>Total TTC</span>
          <span className="font-medium">0,00 €</span>
        </div>
      </div>

      {showClientForm && (
        <ClientForm 
          onClose={() => setShowClientForm(false)}
        />
      )}
    </div>
  );
}

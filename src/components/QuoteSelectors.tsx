
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ClientForm } from "./ClientForm";
import { ProjectForm } from "./ProjectForm";
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
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const filteredClients = clientSearch 
    ? clients.filter(client => 
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(clientSearch.toLowerCase())
      )
    : clients;

  const clientProjects = selectedClientId 
    ? projects.filter(project => project.client === selectedClientId)
    : [];

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox" 
              className="w-full justify-between text-gray-500 bg-white"
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
          <PopoverContent className="w-full p-0 bg-white">
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
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox" 
              className="w-full justify-between text-gray-500 bg-white"
              disabled={!selectedClientId}
            >
              {selectedProjectId 
                ? projects.find(p => p.id === selectedProjectId)?.name || "Sélectionner un chantier"
                : "Sélectionner un chantier"
              }
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white shadow-md">
            <div className="max-h-60 overflow-y-auto">
              {clientProjects.length > 0 ? (
                <div className="w-full">
                  {clientProjects.map((project) => (
                    <div
                      key={project.id}
                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        onProjectSelect(project.id);
                        document.body.click(); // Close the popover
                      }}
                    >
                      {project.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm p-4 text-center text-gray-500">
                  Aucun résultat trouvé
                </div>
              )}
            </div>
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-t-none"
              onClick={() => setShowProjectForm(true)}
              disabled={!selectedClientId}
            >
              Nouveau chantier
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {showClientForm && (
        <ClientForm 
          onClose={() => setShowClientForm(false)}
        />
      )}

      {showProjectForm && selectedClientId && (
        <ProjectForm 
          clientId={selectedClientId}
          onClose={() => setShowProjectForm(false)} 
        />
      )}
    </div>
  );
}

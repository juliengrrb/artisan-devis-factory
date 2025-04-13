
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
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
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border p-0 shadow-lg z-50"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <div className="p-2 border-b">
              <Input
                placeholder="Rechercher un client..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <DropdownMenuItem
                    key={client.id}
                    onClick={() => onClientSelect(client.id)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {client.firstName} {client.lastName}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="text-sm p-4 text-center text-gray-500">
                  Aucun client trouvé
                </div>
              )}
            </div>
            <div className="border-t">
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-t-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowClientForm(true);
                }}
              >
                Nouveau client
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!selectedClientId}>
            <Button 
              variant="outline" 
              className="w-full justify-between text-gray-500 bg-white"
              disabled={!selectedClientId}
            >
              {selectedProjectId 
                ? projects.find(p => p.id === selectedProjectId)?.name || "Sélectionner un chantier"
                : "Sélectionner un chantier"
              }
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border p-0 shadow-lg z-50"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <div className="max-h-60 overflow-y-auto">
              {clientProjects.length > 0 ? (
                clientProjects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => onProjectSelect(project.id)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {project.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="text-sm p-4 text-center text-gray-500">
                  Aucun résultat trouvé
                </div>
              )}
            </div>
            <div className="border-t">
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-t-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowProjectForm(true);
                }}
                disabled={!selectedClientId}
              >
                Nouveau chantier
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
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

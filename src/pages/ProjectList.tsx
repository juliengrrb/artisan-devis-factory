
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { ProjectForm } from "@/components/ProjectForm";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash, Pencil } from "lucide-react";
import { Project } from "@/types";
import { toast } from "sonner";

export default function ProjectList() {
  const { projects, clients, deleteProject } = useAppContext();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chantier ?")) {
      deleteProject(id);
      toast.success("Chantier supprimé avec succès");
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clients.find(c => c.id === project.client)?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : "Client inconnu";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Chantiers</h1>
        <Button 
          className="bg-devis-blue hover:bg-blue-700 text-white"
          onClick={() => {
            setEditingProject(undefined);
            setShowProjectForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau chantier
        </Button>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-md shadow overflow-hidden">
          <div className="p-4 border-b">
            <input 
              type="text" 
              placeholder="Rechercher un chantier..." 
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
                    Nom du chantier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map(project => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {project.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {getClientName(project.client)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {project.description || "Aucune description"}
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
                          onClick={() => handleEditProject(project)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Aucun chantier trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {showProjectForm && (
        <ProjectForm 
          project={editingProject}
          clientId={editingProject?.client}
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(undefined);
          }} 
        />
      )}
    </div>
  );
}

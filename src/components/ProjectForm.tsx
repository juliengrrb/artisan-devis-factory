
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Project } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { X } from "lucide-react";

interface ProjectFormProps {
  project?: Project;
  clientId?: string;
  onClose: () => void;
}

export function ProjectForm({ project, clientId, onClose }: ProjectFormProps) {
  const { addProject, updateProject, clients } = useAppContext();
  
  const [formData, setFormData] = useState<Partial<Project>>(project || {
    name: '',
    client: clientId || '',
    description: '',
    notes: ''
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Si c'est le champ nom et qu'il commence à taper "Rénovation"
    if (name === "name" && value.startsWith("Rénovation")) {
      setSuggestions(["Rénovation du restaurant", "Rénovation complète", "Rénovation partielle"]);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData({
      ...formData,
      name: suggestion
    });
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (project) {
      updateProject({
        ...project,
        ...formData
      } as Project);
    } else {
      addProject({
        id: Date.now().toString(),
        ...formData
      } as Project);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-medium">
            {project ? 'Modifier le chantier' : 'Nouveau chantier'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Client</label>
            <Input 
              value={clients.find(c => c.id === formData.client)?.firstName + ' ' + clients.find(c => c.id === formData.client)?.lastName || ''}
              disabled
              className="bg-gray-100"
            />
          </div>
          
          <div className="mb-4 relative">
            <label className="block text-sm font-medium mb-2">
              Nom du chantier <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg mt-1">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Notes</label>
            <Textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-devis-blue text-white hover:bg-blue-600">
              {project ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

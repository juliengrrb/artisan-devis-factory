
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Client } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { X } from "lucide-react";

interface ClientFormProps {
  client?: Client;
  onClose: () => void;
}

export function ClientForm({ client, onClose }: ClientFormProps) {
  const { addClient, updateClient } = useAppContext();
  
  const [formData, setFormData] = useState<Partial<Client>>(client || {
    civility: 'M',
    type: 'Particulier',
    firstName: '',
    lastName: '',
    address: '',
    addressComplement: '',
    zipCode: '',
    city: '',
    country: 'France',
    email: '',
    phone: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCivilityClick = (civility: 'M' | 'Mme' | 'M et Mme') => {
    setFormData({
      ...formData,
      civility
    });
  };

  const handleTypeClick = (type: 'Particulier' | 'Professionnel') => {
    setFormData({
      ...formData,
      type
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (client) {
      updateClient({
        ...client,
        ...formData
      } as Client);
    } else {
      addClient({
        id: Date.now().toString(),
        ...formData
      } as Client);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-medium">
            {client ? 'Modifier le client' : 'Nouveau client'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {formData.type === 'Particulier' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Statut</label>
                <div className="flex space-x-1 mb-4">
                  <Button
                    type="button"
                    className={`px-4 py-2 ${formData.type === 'Particulier' ? 'bg-devis-blue text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => handleTypeClick('Particulier')}
                  >
                    Particulier
                  </Button>
                  <Button
                    type="button"
                    className={`px-4 py-2 ${formData.type === 'Professionnel' ? 'bg-devis-blue text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => handleTypeClick('Professionnel')}
                  >
                    Professionnel
                  </Button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Civilité</label>
                <div className="flex space-x-1 mb-4">
                  <Button
                    type="button"
                    className={`px-4 py-2 ${formData.civility === 'M' ? 'bg-devis-blue text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => handleCivilityClick('M')}
                  >
                    M
                  </Button>
                  <Button
                    type="button"
                    className={`px-4 py-2 ${formData.civility === 'Mme' ? 'bg-devis-blue text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => handleCivilityClick('Mme')}
                  >
                    Mme
                  </Button>
                  <Button
                    type="button"
                    className={`px-4 py-2 ${formData.civility === 'M et Mme' ? 'bg-devis-blue text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => handleCivilityClick('M et Mme')}
                  >
                    M et Mme
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prénom</label>
                  <Input
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Adresse</label>
            <Input
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              placeholder="97 Rue de Rivoli"
              className="mb-2"
            />
            <Input
              name="addressComplement"
              value={formData.addressComplement || ''}
              onChange={handleChange}
              placeholder="Complément d'adresse (Bât, Appt...)"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Input
                name="zipCode"
                value={formData.zipCode || ''}
                onChange={handleChange}
                placeholder="75001"
              />
            </div>
            <div>
              <Input
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                placeholder="Paris"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <select
              name="country"
              value={formData.country || 'France'}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Adresse email</label>
              <Input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="lefevre@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Téléphone</label>
              <Input
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="0123456754"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Notes</label>
            <Textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              placeholder="Maison et dépendance difficile d'accès."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-devis-blue text-white hover:bg-blue-600">
              {client ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

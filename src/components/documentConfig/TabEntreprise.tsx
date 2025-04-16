
import React from "react";
import { DocumentConfig } from "../../types/documentConfig";

type TabEntrepriseProps = {
  config: DocumentConfig;
  updateConfig: (section: string, data: any) => void;
};

const TabEntreprise = ({ config, updateConfig }: TabEntrepriseProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    
    updateConfig("company", {
      [name]: type === "checkbox" ? checked : value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="company-name" className="block text-sm font-medium mb-1">
            Nom de votre entreprise <span className="text-red-500">*</span>
          </label>
          <input
            id="company-name"
            name="name"
            type="text"
            value={config.company.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="legal-form" className="block text-sm font-medium mb-1">
            Forme juridique <span className="text-red-500">*</span>
          </label>
          <select
            id="legal-form"
            name="legalForm"
            value={config.company.legalForm}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
            required
          >
            <option value="SARL">SARL</option>
            <option value="SAS">SAS</option>
            <option value="SASU">SASU</option>
            <option value="EURL">EURL</option>
            <option value="EI">EI</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Adresse <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          name="address"
          type="text"
          value={config.company.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div>
        <label htmlFor="address-complement" className="block text-sm font-medium mb-1">
          Complément d'adresse (Bât, Appt...)
        </label>
        <input
          id="address-complement"
          name="addressComplement"
          type="text"
          value={config.company.addressComplement}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="zip-code" className="block text-sm font-medium mb-1">Code postal</label>
          <input
            id="zip-code"
            name="zipCode"
            type="text"
            value={config.company.zipCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">Ville</label>
          <input
            id="city"
            name="city"
            type="text"
            value={config.company.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium mb-1">Pays</label>
        <select
          id="country"
          name="country"
          value={config.company.country}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
        >
          <option value="France">France</option>
          <option value="Belgique">Belgique</option>
          <option value="Suisse">Suisse</option>
          <option value="Luxembourg">Luxembourg</option>
          <option value="Canada">Canada</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Téléphone professionnel <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={config.company.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Adresse email professionnelle <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={config.company.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium mb-1">Site Internet</label>
        <input
          id="website"
          name="website"
          type="url"
          value={config.company.website}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="registration-number" className="block text-sm font-medium mb-1">
          Numéro d'inscription au registre des métiers
        </label>
        <input
          id="registration-number"
          name="registrationNumber"
          type="text"
          value={config.company.registrationNumber}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="rcs" className="block text-sm font-medium mb-1">RCS</label>
        <input
          id="rcs"
          name="rcs"
          type="text"
          value={config.company.rcs}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="siret" className="block text-sm font-medium mb-1">SIRET</label>
        <input
          id="siret"
          name="siret"
          type="text"
          value={config.company.siret}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="naf" className="block text-sm font-medium mb-1">NAF</label>
        <input
          id="naf"
          name="naf"
          type="text"
          value={config.company.naf}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="capital" className="block text-sm font-medium mb-1">Capital social</label>
        <input
          id="capital"
          name="capital"
          type="text"
          value={config.company.capital}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="insurance" className="block text-sm font-medium mb-1">Garantie</label>
          <select
            id="insurance"
            name="insurance"
            value={config.company.insurance}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
          >
            <option value="Biennale">Biennale</option>
            <option value="Décennale">Décennale</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div>
          <label htmlFor="insurance-name" className="block text-sm font-medium mb-1">Nom de l'assureur</label>
          <input
            id="insurance-name"
            name="insuranceName"
            type="text"
            value={config.company.insuranceName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="vat-number" className="block text-sm font-medium mb-1">Numéro de TVA</label>
        <div className="flex items-center justify-between">
          <input
            id="vat-number"
            name="vatNumber"
            type="text"
            value={config.company.vatNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={config.company.vatExempt}
          />
          <div className="ml-4 flex items-center">
            <input
              id="vat-exempt"
              name="vatExempt"
              type="checkbox"
              checked={config.company.vatExempt}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="vat-exempt" className="text-sm">Non assujetti</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabEntreprise;

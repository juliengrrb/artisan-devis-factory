
import React from "react";
import { DocumentConfig } from "../../types/documentConfig";

type TabDevisProps = {
  config: DocumentConfig;
  updateConfig: (section: string, data: any) => void;
};

const TabDevis = ({ config, updateConfig }: TabDevisProps) => {
  const handleDevisChange = (data: Partial<DocumentConfig["quote"]>) => {
    updateConfig("quote", data);
  };

  const handlePaymentMethodChange = (method: keyof DocumentConfig["quote"]["paymentMethods"], checked: boolean) => {
    handleDevisChange({
      paymentMethods: {
        ...config.quote.paymentMethods,
        [method]: checked
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="validity-period" className="block text-sm font-medium mb-1">
          Durée de validité
        </label>
        <select
          id="validity-period"
          value={config.quote.validityPeriod}
          onChange={(e) => handleDevisChange({ validityPeriod: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
        >
          <option value="15 jours">15 jours</option>
          <option value="30 jours">30 jours</option>
          <option value="45 jours">45 jours</option>
          <option value="60 jours">60 jours</option>
          <option value="90 jours">90 jours</option>
        </select>
      </div>

      <div>
        <label htmlFor="quote-number" className="block text-sm font-medium mb-1">
          Numérotation
        </label>
        <div className="flex items-center">
          <input
            id="quote-number"
            type="text"
            value={config.quote.number}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
          />
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
          >
            Modifier numérotation
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="quote-notes" className="block text-sm font-medium mb-1">
          Notes de bas de page
        </label>
        <textarea 
          id="quote-notes"
          value={config.quote.notes}
          onChange={(e) => handleDevisChange({ notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
        />
      </div>

      <div>
        <h3 className="text-base font-medium mb-2">Méthodes de paiement</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="payment-cheque" 
              checked={config.quote.paymentMethods.cheque} 
              onChange={(e) => handlePaymentMethodChange('cheque', e.target.checked)}
              className="mr-2" 
            />
            <label htmlFor="payment-cheque">Chèque</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="payment-cash" 
              checked={config.quote.paymentMethods.cash} 
              onChange={(e) => handlePaymentMethodChange('cash', e.target.checked)}
              className="mr-2" 
            />
            <label htmlFor="payment-cash">Espèces</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="payment-transfer" 
              checked={config.quote.paymentMethods.bankTransfer} 
              onChange={(e) => handlePaymentMethodChange('bankTransfer', e.target.checked)}
              className="mr-2" 
            />
            <label htmlFor="payment-transfer">Virement bancaire</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="payment-card" 
              checked={config.quote.paymentMethods.creditCard} 
              onChange={(e) => handlePaymentMethodChange('creditCard', e.target.checked)}
              className="mr-2" 
            />
            <label htmlFor="payment-card">Carte bancaire</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabDevis;

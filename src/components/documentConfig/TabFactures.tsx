
import React from "react";
import { DocumentConfig } from "../../types/documentConfig";

type TabFacturesProps = {
  config: DocumentConfig;
  updateConfig: (section: string, data: any) => void;
};

const TabFactures = ({ config, updateConfig }: TabFacturesProps) => {
  const handleInvoiceChange = (data: Partial<DocumentConfig["invoice"]>) => {
    updateConfig("invoice", data);
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="invoice-number" className="block text-sm font-medium mb-1">
          Numérotation des factures
        </label>
        <div className="flex items-center">
          <input
            id="invoice-number"
            type="text"
            value={config.invoice.number}
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
        <label htmlFor="invoice-notes" className="block text-sm font-medium mb-1">
          Notes de bas de page
        </label>
        <textarea 
          id="invoice-notes"
          value={config.invoice.notes}
          onChange={(e) => handleInvoiceChange({ notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
        />
      </div>
    </div>
  );
};

export default TabFactures;


import React from "react";
import { DocumentConfig } from "../../types/documentConfig";

type TabPiedsPagesProps = {
  config: DocumentConfig;
  updateConfig: (section: string, data: any) => void;
};

const TabPiedsPages = ({ config, updateConfig }: TabPiedsPagesProps) => {
  const handleFooterChange = (data: Partial<DocumentConfig["footer"]>) => {
    updateConfig("footer", data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Texte en pied de page</h3>
        <textarea 
          value={config.footer.text}
          onChange={(e) => handleFooterChange({ text: e.target.value })}
          placeholder="Ajoutez ici votre texte de pied de page..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md h-40"
        />
      </div>
    </div>
  );
};

export default TabPiedsPages;


import React from "react";
import { DocumentConfig } from "../../types/documentConfig";

type TabMesDocumentsProps = {
  config: DocumentConfig;
  updateConfig: (section: string, data: any) => void;
};

const TabMesDocuments = ({ config, updateConfig }: TabMesDocumentsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Mes documents</h2>
      <p className="text-gray-600">
        Configurez vos modèles de documents pour un look professionnel. Personnalisez les couleurs, 
        logos, et informations d'entreprise pour tous vos devis et factures.
      </p>
      
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-md text-blue-700">
        <h3 className="font-medium mb-2">Conseils :</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ajoutez votre logo dans l'onglet "Visuels"</li>
          <li>Complétez vos informations d'entreprise dans l'onglet "Entreprise"</li>
          <li>Ajoutez vos certifications dans l'onglet "Labels"</li>
          <li>Personnalisez les textes d'en-tête et de pied de page</li>
        </ul>
      </div>
    </div>
  );
};

export default TabMesDocuments;

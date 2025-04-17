
import React from "react";
import { Slider } from "../ui/slider";
import { DocumentConfig } from "../../types/documentConfig";

type TabLabelsProps = {
  config: DocumentConfig;
  updateConfig: (section: string, data: any) => void;
};

const TabLabels = ({ config, updateConfig }: TabLabelsProps) => {
  const handleLabelChange = (data: Partial<DocumentConfig["label"]>) => {
    updateConfig("label", data);
  };

  const labels = [
    {
      id: "rge-eco-artisan",
      name: "RGE Eco Artisan",
      logo: "/public/lovable-uploads/21acc4e9-3206-44ab-86b3-b9b241cc3927.png" // Using one of the uploaded images
    }
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-medium mb-3">Position</h3>
        <div className="flex gap-3 mb-3 items-center">
          <input 
            type="checkbox" 
            id="hide-label" 
            checked={config.label.hidden} 
            onChange={(e) => handleLabelChange({ hidden: e.target.checked })}
            className="mr-1" 
          />
          <label htmlFor="hide-label" className="text-sm">Masquer</label>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3, "Bas"].map((pos) => (
            <button
              key={pos.toString()}
              className={`border rounded-full w-8 h-8 flex items-center justify-center text-sm ${
                config.label.position === pos ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-500'
              }`}
              onClick={() => handleLabelChange({ position: pos })}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium mb-2">Taille</h3>
        <Slider 
          value={[config.label.size]} 
          min={20} 
          max={100}
          step={1}
          onValueChange={(value) => handleLabelChange({ size: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <button 
          className="px-3 py-1.5 mb-4 border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          Ajouter des labels
        </button>
        
        <div className="border border-gray-200 rounded p-3">
          <table className="w-full">
            <tbody>
              {labels.map((label) => (
                <tr key={label.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 w-10">
                    <div className="flex items-center h-full">
                      <input 
                        type="checkbox" 
                        checked={config.label.selected === label.id} 
                        onChange={() => handleLabelChange({ selected: label.id })}
                        className="ml-1" 
                      />
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center">
                      <img src={label.logo} alt={label.name} className="h-8 mr-3" />
                      <span className="text-sm">{label.name}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TabLabels;

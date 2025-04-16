
import React from "react";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Upload
} from "lucide-react";
import { Slider } from "../ui/slider";
import { DocumentConfig } from "../../types/documentConfig";

type TabVisuelsProps = {
  config: DocumentConfig;
  updateConfig: (section: string, data: any) => void;
};

const TabVisuels = ({ config, updateConfig }: TabVisuelsProps) => {
  const handleLogoChange = (data: Partial<DocumentConfig["logo"]>) => {
    updateConfig("logo", data);
  };

  const handleHeaderOrderChange = (index: number) => {
    // This would actually need more complex logic to handle reordering
    updateConfig("headerOrder", [...config.headerOrder]);
  };

  const handleTableStyleChange = (style: string) => {
    updateConfig("tableStyle", style);
  };

  const handleColorChange = (color: string) => {
    updateConfig("color", color);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload this file to a server
      // For now, we'll just use a placeholder URL
      handleLogoChange({ url: URL.createObjectURL(file) });
    }
  };

  const colors = [
    "#e0e0e0", "#616161", "#bbdefb", "#42a5f5", "#3f51b5", 
    "#2c387e", "#1a237e", "#8bc34a", "#cddc39", "#33691e", 
    "#ffeb3b", "#ff9800", "#e53935", "#7b1fa2", "#551da2", 
    "#ff80ab", "#a52714", "#4e342e", "#000000"
  ];

  return (
    <div>
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">Logo</h2>
        <div className="flex items-center mb-4">
          {config.logo.url ? (
            <div className="w-24 h-24 flex items-center justify-center mr-4 border border-gray-200">
              <img 
                src={config.logo.url} 
                alt="Logo" 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mr-4 rounded-lg">
              <span className="text-gray-400 text-xs text-center">VOTRE LOGO</span>
            </div>
          )}
          <div>
            <label 
              htmlFor="logo-upload" 
              className="px-4 py-2 mb-3 border border-gray-300 rounded-md inline-block cursor-pointer hover:bg-gray-50"
            >
              Ajouter votre logo
            </label>
            <input 
              id="logo-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <div className="flex items-center mt-2">
              <input 
                type="checkbox" 
                id="no-logo" 
                checked={config.logo.noLogo} 
                onChange={(e) => handleLogoChange({ noLogo: e.target.checked })}
                className="mr-2" 
              />
              <label htmlFor="no-logo">Je n'ai pas de logo</label>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-base font-medium mb-2">Alignement</h3>
        <div className="flex gap-2 mb-4">
          <button 
            className={`p-2 border rounded-md ${config.logo.alignment === 'left' ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-500'}`}
            onClick={() => handleLogoChange({ alignment: 'left' })}
          >
            <AlignLeft size={16} />
          </button>
          <button 
            className={`p-2 border rounded-md ${config.logo.alignment === 'center' ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-500'}`}
            onClick={() => handleLogoChange({ alignment: 'center' })}
          >
            <AlignCenter size={16} />
          </button>
          <button 
            className={`p-2 border rounded-md ${config.logo.alignment === 'right' ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-500'}`}
            onClick={() => handleLogoChange({ alignment: 'right' })}
          >
            <AlignRight size={16} />
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-base font-medium mb-2">Taille</h3>
        <Slider 
          value={[config.logo.size]} 
          min={20} 
          max={200}
          step={1}
          onValueChange={(value) => handleLogoChange({ size: value[0] })}
          className="w-full"
        />
      </section>

      <section className="mb-8">
        <h3 className="text-base font-medium mb-4">Ordre des éléments de l'entête</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              className={`w-10 h-10 rounded-full border ${
                num === 1 ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-500'
              } flex items-center justify-center`}
              onClick={() => handleHeaderOrderChange(num - 1)}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="flex items-center mt-4">
          <input 
            type="checkbox" 
            id="envelopes" 
            checked={config.envelopes} 
            onChange={(e) => updateConfig("envelopes", e.target.checked)}
            className="mr-2" 
          />
          <label htmlFor="envelopes">Enveloppes à fenêtre</label>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-base font-medium mb-4">Style des tableaux</h3>
        <div className="flex gap-4 mb-4">
          <button
            className={`w-60 h-20 border rounded-md p-3 ${config.tableStyle === 'style1' ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={() => handleTableStyleChange('style1')}
          >
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          </button>
          <button
            className={`w-60 h-20 border rounded-md p-3 ${config.tableStyle === 'style2' ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={() => handleTableStyleChange('style2')}
          >
            <div className="h-full grid grid-cols-4 gap-2">
              <div className="border-r border-gray-200"></div>
              <div className="border-r border-gray-200"></div>
              <div className="border-r border-gray-200"></div>
              <div></div>
            </div>
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-base font-medium mb-4">Couleurs</h3>
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-10 h-10 rounded-full ${config.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default TabVisuels;

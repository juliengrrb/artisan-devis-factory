
import React from "react";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight
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
      <section className="mb-6">
        <h3 className="text-base font-medium mb-3">Logo</h3>
        <div className="flex items-center mb-3">
          {config.logo.url ? (
            <div className="w-16 h-16 flex items-center justify-center mr-4 border border-gray-200 rounded">
              <img 
                src={config.logo.url} 
                alt="Logo" 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mr-4 rounded-full">
              <span className="text-gray-400 text-xs text-center">VOTRE LOGO</span>
            </div>
          )}
          <div>
            <label 
              htmlFor="logo-upload" 
              className="px-3 py-1.5 border border-gray-300 rounded inline-block cursor-pointer hover:bg-gray-50 text-sm"
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
          </div>
        </div>
        <div className="flex items-center mt-2">
          <input 
            type="checkbox" 
            id="no-logo" 
            checked={config.logo.noLogo} 
            onChange={(e) => handleLogoChange({ noLogo: e.target.checked })}
            className="mr-2" 
          />
          <label htmlFor="no-logo" className="text-sm">Je n'ai pas de logo</label>
        </div>
      </section>

      <section className="mb-5">
        <h3 className="text-base font-medium mb-2">Alignement</h3>
        <div className="flex gap-2 mb-4">
          <button 
            className={`p-2 border rounded ${config.logo.alignment === 'left' ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-500'}`}
            onClick={() => handleLogoChange({ alignment: 'left' })}
          >
            <AlignLeft size={16} />
          </button>
          <button 
            className={`p-2 border rounded ${config.logo.alignment === 'center' ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-500'}`}
            onClick={() => handleLogoChange({ alignment: 'center' })}
          >
            <AlignCenter size={16} />
          </button>
          <button 
            className={`p-2 border rounded ${config.logo.alignment === 'right' ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-500'}`}
            onClick={() => handleLogoChange({ alignment: 'right' })}
          >
            <AlignRight size={16} />
          </button>
        </div>
      </section>

      <section className="mb-6">
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

      <section className="mb-6">
        <h3 className="text-base font-medium mb-3">Ordre des éléments de l'entête</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              className={`w-8 h-8 rounded-full border ${
                num === 1 ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-500'
              } flex items-center justify-center text-sm`}
              onClick={() => {}}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="flex items-center mt-3">
          <input 
            type="checkbox" 
            id="envelopes" 
            checked={config.envelopes} 
            onChange={(e) => updateConfig("envelopes", e.target.checked)}
            className="mr-2" 
          />
          <label htmlFor="envelopes" className="text-sm">Enveloppes à fenêtre</label>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-base font-medium mb-3">Style des tableaux</h3>
        <div className="flex gap-3 mb-4">
          <button
            className={`w-48 h-16 border rounded p-2 ${config.tableStyle === 'style1' ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={() => handleTableStyleChange('style1')}
          >
            <div className="space-y-1.5">
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
            </div>
          </button>
          <button
            className={`w-48 h-16 border rounded p-2 ${config.tableStyle === 'style2' ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={() => handleTableStyleChange('style2')}
          >
            <div className="h-full grid grid-cols-4 gap-1">
              <div className="border-r border-gray-200"></div>
              <div className="border-r border-gray-200"></div>
              <div className="border-r border-gray-200"></div>
              <div></div>
            </div>
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-base font-medium mb-3">Couleurs</h3>
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full ${config.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
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

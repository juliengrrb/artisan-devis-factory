
import React, { useCallback } from "react";
import { AlignLeft, AlignCenter, AlignRight, Upload, Check } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { DocumentConfig } from "../../types/documentConfig";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type TabVisuelsProps = {
  config: DocumentConfig;
  updateConfig: (section: string, data: any) => void;
};

const TabVisuels = ({ config, updateConfig }: TabVisuelsProps) => {
  const handleLogoChange = useCallback((data: Partial<DocumentConfig["logo"]>) => {
    updateConfig("logo", { ...config.logo, ...data });
  }, [config.logo, updateConfig]);

  const handleTableStyleChange = useCallback((style: string) => {
    updateConfig("tableStyle", style);
  }, [updateConfig]);

  const handleColorChange = useCallback((color: string) => {
    updateConfig("color", color);
  }, [updateConfig]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleLogoChange({ url: URL.createObjectURL(file) });
    }
  }, [handleLogoChange]);

  const handleHeaderOrderChange = useCallback((index: number) => {
    const newOrder = [...(config.headerOrder || [1, 2, 3, 4, 5, 6])];
    // Move the clicked index to the front
    const value = newOrder.splice(index, 1)[0];
    newOrder.unshift(value);
    updateConfig("headerOrder", newOrder);
  }, [config.headerOrder, updateConfig]);

  return (
    <div className="space-y-6">
      {/* Logo section */}
      <section className="pb-4 border-b border-gray-100">
        <h3 className="text-base font-medium mb-3">Logo</h3>
        <div className="flex items-start mb-4">
          <div className="mr-4">
            {config.logo.url ? (
              <div className="w-24 h-24 flex items-center justify-center border border-gray-200 rounded bg-white">
                <img src={config.logo.url} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded text-center">
                <span className="text-gray-400 text-xs">VOTRE LOGO</span>
              </div>
            )}
          </div>
          <div>
            <label 
              htmlFor="logo-upload"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-sm cursor-pointer hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-1" />
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
        <div className="flex items-center">
          <Checkbox 
            id="no-logo" 
            checked={!!config.logo.noLogo}
            onCheckedChange={(checked) => handleLogoChange({ noLogo: !!checked })}
          />
          <label htmlFor="no-logo" className="text-sm ml-2">Je n'ai pas de logo</label>
        </div>
      </section>

      {/* Alignment section */}
      <section className="pb-4 border-b border-gray-100">
        <h3 className="text-base font-medium mb-3">Alignement</h3>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "border-gray-200 h-8 w-8",
                    config.logo.alignment === "left" && "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => handleLogoChange({ alignment: "left" })}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Aligner à gauche</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "border-gray-200 h-8 w-8",
                    config.logo.alignment === "center" && "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => handleLogoChange({ alignment: "center" })}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Centrer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "border-gray-200 h-8 w-8",
                    config.logo.alignment === "right" && "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => handleLogoChange({ alignment: "right" })}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Aligner à droite</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </section>

      {/* Size section */}
      <section className="pb-4 border-b border-gray-100">
        <h3 className="text-base font-medium mb-3">Taille</h3>
        <Slider
          value={[config.logo.size]}
          min={20}
          max={200}
          step={1}
          onValueChange={(value) => handleLogoChange({ size: value[0] })}
          className="w-full"
        />
      </section>

      {/* Header elements order section */}
      <section className="pt-1 pb-4 border-b border-gray-100">
        <h3 className="text-base font-medium mb-3">Ordre des éléments de l'en-tête</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              className={cn(
                "w-8 h-8 rounded-full border text-sm flex items-center justify-center",
                (config.headerOrder?.[0] === num)
                  ? "border-blue-400 text-blue-600 bg-blue-50"
                  : "border-gray-300 text-gray-500 hover:bg-gray-50"
              )}
              onClick={() => handleHeaderOrderChange(num - 1)}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="flex items-center">
          <Checkbox
            id="envelopes"
            checked={!!config.envelopes}
            onCheckedChange={(checked) => updateConfig("envelopes", !!checked)}
          />
          <label htmlFor="envelopes" className="text-sm ml-2">
            Enveloppes à fenêtre
          </label>
        </div>
      </section>

      {/* Table style section */}
      <section className="pt-1 pb-4 border-b border-gray-100">
        <h3 className="text-base font-medium mb-3">Style des tableaux</h3>
        <div className="flex gap-4">
          <button
            className={cn(
              "w-40 h-16 border rounded p-2 relative",
              config.tableStyle === "style1" 
                ? "border-blue-300" 
                : "border-gray-300"
            )}
            onClick={() => handleTableStyleChange("style1")}
          >
            <div className="space-y-1.5">
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
            </div>
            {config.tableStyle === "style1" && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
          <button
            className={cn(
              "w-40 h-16 border rounded p-2 relative",
              config.tableStyle === "style2" 
                ? "border-blue-300" 
                : "border-gray-300"
            )}
            onClick={() => handleTableStyleChange("style2")}
          >
            <div className="h-full grid grid-cols-4 gap-1">
              <div className="border-r border-gray-200"></div>
              <div className="border-r border-gray-200"></div>
              <div className="border-r border-gray-200"></div>
              <div></div>
            </div>
            {config.tableStyle === "style2" && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        </div>
      </section>

      {/* Colors section */}
      <section className="pt-1">
        <h3 className="text-base font-medium mb-3">Couleurs</h3>
        <div className="grid grid-cols-10 gap-2">
          {[
            "#e0e0e0", "#616161", "#bbdefb", "#42a5f5", "#3f51b5",
            "#2c387e", "#1a237e", "#8bc34a", "#cddc39", "#33691e",
            "#ffeb3b", "#ff9800", "#e53935", "#7b1fa2", "#551da2",
            "#ff80ab", "#a52714", "#4e342e", "#000000", "#ffffff"
          ].map((color) => (
            <button
              key={color}
              className={cn(
                "w-8 h-8 rounded-full relative",
                config.color === color && "ring-2 ring-offset-2 ring-blue-500"
              )}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              aria-label={`Select color ${color}`}
            >
              {config.color === color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {color === "#ffffff" ? (
                    <Check className="w-4 h-4 text-black" />
                  ) : (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TabVisuels;

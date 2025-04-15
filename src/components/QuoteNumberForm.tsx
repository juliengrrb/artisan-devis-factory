import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Quote } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { X } from "lucide-react";

interface QuoteNumberFormProps {
  quote: Quote;
  onClose: () => void;
}

export function QuoteNumberForm({ quote, onClose }: QuoteNumberFormProps) {
  const { updateQuote } = useAppContext();
  
  const [prefix, setPrefix] = useState("DEV");
  const [separator, setSeparator] = useState("/");
  const [dateFormat, setDateFormat] = useState("Année + Mois");
  const [numberLength, setNumberLength] = useState("4");
  const [currentNumber, setCurrentNumber] = useState("45");
  
  const [previewNumber, setPreviewNumber] = useState(quote.number);

  useEffect(() => {
    // Extract current values from the quote.number
    if (quote.number) {
      const parts = quote.number.split(/[-\/]/);
      if (parts.length >= 2) {
        setPrefix(parts[0]);
        
        // Detect separator
        const separator = quote.number.includes('/') ? '/' : '-';
        setSeparator(separator);
        
        // Extract the number part which should be the last part
        const num = parts[parts.length - 1];
        setCurrentNumber(num);
        
        // Detect number length
        setNumberLength(num.length.toString());
        
        // Detect date format
        const middlePart = parts.length > 2 ? parts[1] : '';
        if (middlePart.length === 6) { // Format like "201907"
          setDateFormat("Année + Mois");
        } else if (middlePart.length === 4) { // Format like "2019"
          setDateFormat("Année");
        }
      }
    }
  }, [quote.number]);

  const updatePreview = () => {
    const year = "2019";
    const month = "07";
    const num = currentNumber.padStart(parseInt(numberLength), '0');
    
    if (dateFormat === "Année + Mois") {
      setPreviewNumber(`${prefix}${separator}${year}${month}${separator}${num}`);
    } else {
      setPreviewNumber(`${prefix}${separator}${year}${separator}${num}`);
    }
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrefix(e.target.value);
    setTimeout(updatePreview, 0);
  };

  const handleSeparatorChange = (value: string) => {
    setSeparator(value);
    setTimeout(updatePreview, 0);
  };

  const handleDateFormatChange = (value: string) => {
    setDateFormat(value);
    setTimeout(updatePreview, 0);
  };

  const handleNumberLengthChange = (value: string) => {
    setNumberLength(value);
    setTimeout(updatePreview, 0);
  };

  const handleCurrentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentNumber(e.target.value);
    setTimeout(updatePreview, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateQuote({
      ...quote,
      number: previewNumber
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg w-full max-w-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-medium">Format du numéro de devis</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Préfixe</label>
            <Input
              value={prefix}
              onChange={handlePrefixChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Séparateur</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="separator"
                  checked={separator === "-"}
                  onChange={() => handleSeparatorChange("-")}
                  className="mr-2"
                />
                -
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="separator"
                  checked={separator === "/"}
                  onChange={() => handleSeparatorChange("/")}
                  className="mr-2"
                />
                /
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="separator"
                  checked={separator === ""}
                  onChange={() => handleSeparatorChange("")}
                  className="mr-2"
                />
                Aucun
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Format de la date</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateFormat"
                  checked={dateFormat === "Année"}
                  onChange={() => handleDateFormatChange("Année")}
                  className="mr-2"
                />
                Année
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateFormat"
                  checked={dateFormat === "Année + Mois"}
                  onChange={() => handleDateFormatChange("Année + Mois")}
                  className="mr-2"
                />
                Année + Mois
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Longueur de numérotation</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="numberLength"
                  checked={numberLength === "3"}
                  onChange={() => handleNumberLengthChange("3")}
                  className="mr-2"
                />
                3
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="numberLength"
                  checked={numberLength === "4"}
                  onChange={() => handleNumberLengthChange("4")}
                  className="mr-2"
                />
                4
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="numberLength"
                  checked={numberLength === "5"}
                  onChange={() => handleNumberLengthChange("5")}
                  className="mr-2"
                />
                5
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="numberLength"
                  checked={numberLength === "6"}
                  onChange={() => handleNumberLengthChange("6")}
                  className="mr-2"
                />
                6
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Numéro courant</label>
            <Input
              value={currentNumber}
              onChange={handleCurrentNumberChange}
            />
          </div>
          
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50 mb-6">
            <p className="text-center text-xl">{previewNumber}</p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-devis-blue text-white hover:bg-blue-600">
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

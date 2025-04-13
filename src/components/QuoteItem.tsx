import { QuoteItem as QuoteItemType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Check, Hash } from "lucide-react";

interface QuoteItemProps {
  item: QuoteItemType;
  onUpdate: (item: QuoteItemType) => void;
  isEditing: boolean;
  itemNumber?: string; // Hierarchical item number
}

export function QuoteItem({ item, onUpdate, isEditing, itemNumber }: QuoteItemProps) {
  const [isEditable, setIsEditable] = useState(false);
  const [editedItem, setEditedItem] = useState<QuoteItemType>(item);

  const handleEdit = () => {
    if (['Titre', 'Sous-titre', 'Texte'].includes(item.type || '')) {
      setEditedItem({
        ...item,
        designation: '' // Clear the designation when editing text items
      });
    } else {
      setEditedItem(item);
    }
    setIsEditable(true);
  };

  const handleSave = () => {
    onUpdate(editedItem);
    setIsEditable(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const updatedItem = {
      ...editedItem,
      [name]: name === 'quantity' || name === 'unitPrice' || name === 'vat' 
        ? parseFloat(value) 
        : value
    };
    
    if (name === 'quantity' || name === 'unitPrice') {
      updatedItem.totalHT = parseFloat(updatedItem.quantity.toString()) * parseFloat(updatedItem.unitPrice.toString());
    }
    
    setEditedItem(updatedItem);
  };

  const getPaddingLeft = () => {
    return `${item.level * 20}px`;
  };

  const getBgColor = () => {
    // Light blue background for all special types (Titre, Sous-titre, Texte)
    if (['Titre', 'Sous-titre', 'Texte'].includes(item.type || '')) {
      return 'bg-devis-lightblue';
    }
    if (['Fourniture', 'Main d\'oeuvre', 'Ouvrage'].includes(item.type || '')) {
      return 'bg-devis-lightblue'; // Changed to light blue background
    }
    if (item.type === 'Saut de page') return 'bg-white';
    if (item.level === 1) return 'bg-devis-header text-white';
    if (item.level === 2) return 'bg-devis-midgray';
    return 'bg-white';
  };

  const isTextItem = () => {
    return ['Titre', 'Sous-titre', 'Texte', 'Saut de page'].includes(item.type || '');
  };

  const getTextItemStyles = () => {
    if (['Titre', 'Sous-titre', 'Texte'].includes(item.type || '')) {
      if (item.type === 'Titre') {
        return 'font-bold text-lg text-black';
      } else if (item.type === 'Sous-titre') {
        return 'font-semibold text-base text-black';
      } else if (item.type === 'Texte') {
        return 'text-base text-black';
      }
    } else if (['Fourniture', 'Main d\'oeuvre', 'Ouvrage'].includes(item.type || '')) {
      return 'text-black font-medium'; // Black text for Fourniture, Main d'oeuvre, Ouvrage
    } else if (item.type === 'Saut de page') {
      return 'text-gray-500';
    }
    return '';
  };

  const isPageBreak = () => {
    return item.type === 'Saut de page';
  };

  const displayItemNumber = () => {
    if (['Titre', 'Sous-titre', 'Fourniture', 'Main d\'oeuvre', 'Ouvrage'].includes(item.type || '') && itemNumber) {
      return itemNumber;
    }
    return '';
  };

  if (!isEditing) {
    return (
      <tr className={`${getBgColor()} border-b border-gray-200 ${isPageBreak() ? 'h-6 border-b-2 border-dashed' : ''}`} data-type={item.type}>
        <td className="py-2 px-4">
          {displayItemNumber() && (
            <div className="flex items-center">
              <span>{displayItemNumber()}</span>
            </div>
          )}
        </td>
        <td className={`py-2 px-4 ${getTextItemStyles()}`} style={{ paddingLeft: getPaddingLeft() }} colSpan={isTextItem() ? 6 : 1}>
          {isPageBreak() ? '- - - - - - - - - - Saut de page - - - - - - - - - -' : item.designation}
          {item.details && !isTextItem() && (
            <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">
              {item.details}
            </div>
          )}
        </td>
        {!isTextItem() && (
          <>
            <td className="py-2 px-4 text-right">{item.quantity || '-'}</td>
            <td className="py-2 px-4 text-center">{item.unit || '-'}</td>
            <td className="py-2 px-4 text-right">{item.unitPrice ? `${item.unitPrice.toFixed(2)} €` : '-'}</td>
            <td className="py-2 px-4 text-right">{item.vat ? `${item.vat} %` : '-'}</td>
            <td className="py-2 px-4 text-right">
              {item.totalHT.toFixed(2)} €
              {item.level <= 2 && (
                <div className="text-sm text-gray-500">Sous-total : {item.totalHT.toFixed(2)} €</div>
              )}
            </td>
          </>
        )}
      </tr>
    );
  }

  if (isEditable) {
    if (isTextItem()) {
      return (
        <tr className="bg-white border-b border-gray-200">
          <td className="py-2 px-4">
            <div className="flex items-center">
              <span>{displayItemNumber()}</span>
            </div>
          </td>
          <td className="py-2 px-4" colSpan={6}>
            <div className="flex items-center w-full">
              <Input
                name="designation"
                value={editedItem.designation}
                onChange={handleChange}
                className="w-full"
                placeholder={`Saisissez votre ${item.type?.toLowerCase() || 'texte'} ici...`}
                autoFocus
              />
              <Button 
                size="sm" 
                variant="ghost" 
                className="ml-2 text-green-600" 
                onClick={handleSave}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
      );
    }
    
    return (
      <tr className="bg-white border-b border-gray-200">
        <td className="py-2 px-4">
          <div className="flex items-center">
            <span>{displayItemNumber()}</span>
          </div>
        </td>
        <td className="py-2 px-4">
          <Input
            name="designation"
            value={editedItem.designation}
            onChange={handleChange}
            className="w-full"
          />
        </td>
        <td className="py-2 px-4">
          <Input
            name="quantity"
            type="number"
            value={editedItem.quantity}
            onChange={handleChange}
            className="w-20"
          />
        </td>
        <td className="py-2 px-4">
          <select
            name="unit"
            value={editedItem.unit}
            onChange={handleChange}
            className="border border-gray-300 rounded p-1"
          >
            <option value="m²">m²</option>
            <option value="u">u</option>
            <option value="ml">ml</option>
            <option value="kg">kg</option>
          </select>
        </td>
        <td className="py-2 px-4">
          <Input
            name="unitPrice"
            type="number"
            step="0.01"
            value={editedItem.unitPrice}
            onChange={handleChange}
            className="w-24"
          />
        </td>
        <td className="py-2 px-4">
          <select
            name="vat"
            value={editedItem.vat}
            onChange={handleChange}
            className="border border-gray-300 rounded p-1"
          >
            <option value="0">0 %</option>
            <option value="10">10 %</option>
            <option value="20">20 %</option>
          </select>
        </td>
        <td className="py-2 px-4 text-right">
          {(editedItem.quantity * editedItem.unitPrice).toFixed(2)} €
          <Button 
            size="sm" 
            variant="ghost" 
            className="ml-2 text-green-600" 
            onClick={handleSave}
          >
            <Check className="h-4 w-4" />
          </Button>
        </td>
      </tr>
    );
  }

  return (
    <tr data-type={item.type} className={`${getBgColor()} border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${isPageBreak() ? 'h-6 border-b-2 border-dashed' : ''}`} onClick={handleEdit}>
      <td className="py-2 px-4">
        {displayItemNumber() && (
          <div className="flex items-center">
            <span>{displayItemNumber()}</span>
          </div>
        )}
      </td>
      <td className={`py-2 px-4 ${getTextItemStyles()}`} style={{ paddingLeft: getPaddingLeft() }} colSpan={isTextItem() ? 6 : 1}>
        {isPageBreak() ? '- - - - - - - - - - Saut de page - - - - - - - - - -' : item.designation}
        {item.details && !isTextItem() && (
          <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">
            {item.details}
          </div>
        )}
      </td>
      {!isTextItem() && (
        <>
          <td className="py-2 px-4 text-right">{item.quantity || '-'}</td>
          <td className="py-2 px-4 text-center">{item.unit || '-'}</td>
          <td className="py-2 px-4 text-right">{item.unitPrice ? `${item.unitPrice.toFixed(2)} €` : '-'}</td>
          <td className="py-2 px-4 text-right">{item.vat ? `${item.vat} %` : '-'}</td>
          <td className="py-2 px-4 text-right">
            {item.totalHT.toFixed(2)} €
            {item.level <= 2 && (
              <div className="text-sm text-gray-500">Sous-total : {item.totalHT.toFixed(2)} €</div>
            )}
          </td>
        </>
      )}
    </tr>
  );
}

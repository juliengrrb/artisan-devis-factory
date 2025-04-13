
import { QuoteItem as QuoteItemType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Check } from "lucide-react";

interface QuoteItemProps {
  item: QuoteItemType;
  onUpdate: (item: QuoteItemType) => void;
  isEditing: boolean;
}

export function QuoteItem({ item, onUpdate, isEditing }: QuoteItemProps) {
  const [isEditable, setIsEditable] = useState(false);
  const [editedItem, setEditedItem] = useState<QuoteItemType>(item);

  const handleEdit = () => {
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
    
    // Recalculate totalHT
    if (name === 'quantity' || name === 'unitPrice') {
      updatedItem.totalHT = parseFloat(updatedItem.quantity.toString()) * parseFloat(updatedItem.unitPrice.toString());
    }
    
    setEditedItem(updatedItem);
  };

  const getPaddingLeft = () => {
    return `${item.level * 20}px`;
  };

  const getBgColor = () => {
    if (item.level === 1) return 'bg-devis-header text-white';
    if (item.level === 2) return 'bg-devis-midgray';
    return 'bg-white';
  };

  if (!isEditing) {
    return (
      <tr className={`${getBgColor()} border-b border-gray-200`}>
        <td className="py-2 px-4">
          <div className="flex items-center">
            <span className="mr-2">{item.id}</span>
          </div>
        </td>
        <td className="py-2 px-4" style={{ paddingLeft: getPaddingLeft() }}>
          {item.designation}
          {item.details && (
            <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">
              {item.details}
            </div>
          )}
        </td>
        <td className="py-2 px-4 text-right">{item.quantity || '-'}</td>
        <td className="py-2 px-4 text-center">{item.unit || '-'}</td>
        <td className="py-2 px-4 text-right">{item.unitPrice ? `${item.unitPrice.toFixed(2)} €` : '-'}</td>
        <td className="py-2 px-4 text-right">{item.vat ? `${item.vat} %` : '-'}</td>
        <td className="py-2 px-4 text-right">{item.totalHT.toFixed(2)} €</td>
      </tr>
    );
  }

  if (isEditable) {
    return (
      <tr className="bg-white border-b border-gray-200">
        <td className="py-2 px-4">
          {item.id}
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
    <tr className={`${getBgColor()} border-b border-gray-200 cursor-pointer hover:bg-gray-50`} onClick={handleEdit}>
      <td className="py-2 px-4">
        {item.id}
      </td>
      <td className="py-2 px-4" style={{ paddingLeft: getPaddingLeft() }}>
        {item.designation}
        {item.details && (
          <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">
            {item.details}
          </div>
        )}
      </td>
      <td className="py-2 px-4 text-right">{item.quantity || '-'}</td>
      <td className="py-2 px-4 text-center">{item.unit || '-'}</td>
      <td className="py-2 px-4 text-right">{item.unitPrice ? `${item.unitPrice.toFixed(2)} €` : '-'}</td>
      <td className="py-2 px-4 text-right">{item.vat ? `${item.vat} %` : '-'}</td>
      <td className="py-2 px-4 text-right">{item.totalHT.toFixed(2)} €</td>
    </tr>
  );
}

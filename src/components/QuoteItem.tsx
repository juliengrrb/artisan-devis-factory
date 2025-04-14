
import { QuoteItem as QuoteItemType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { Check, GripVertical } from "lucide-react";

interface QuoteItemProps {
  item: QuoteItemType;
  onUpdate: (item: QuoteItemType) => void;
  isEditing: boolean;
  itemNumber?: string; // Hierarchical item number
  onDragStart?: (id: string) => void;
  onDragOver?: (id: string) => void;
  onDragEnd?: () => void;
  draggedItemId?: string | null;
}

export function QuoteItem({ 
  item, 
  onUpdate, 
  isEditing, 
  itemNumber,
  onDragStart,
  onDragOver,
  onDragEnd,
  draggedItemId 
}: QuoteItemProps) {
  const [isEditable, setIsEditable] = useState(false);
  const [editedItem, setEditedItem] = useState<QuoteItemType>(item);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const isDragged = draggedItemId === item.id;

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
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

  const getBgColor = () => {
    if (item.type === 'Titre') {
      return 'bg-item-title';
    } else if (item.type === 'Sous-titre') {
      return 'bg-item-subtitle';
    } 
    return 'bg-white';
  };

  const isTextItem = () => {
    return ['Titre', 'Sous-titre', 'Texte', 'Saut de page'].includes(item.type || '');
  };

  const getTextItemStyles = () => {
    if (item.type === 'Titre') {
      return 'text-devis font-medium title-row';
    } else if (item.type === 'Sous-titre') {
      return 'text-devis font-medium subtitle-row';
    }
    return 'text-devis item-row';
  };

  const isPageBreak = () => {
    return item.type === 'Saut de page';
  };

  const isDraggable = () => {
    return !isPageBreak() && !isEditable;
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart && isDraggable()) {
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => {
        if (rowRef.current) {
          rowRef.current.classList.add('opacity-50');
        }
      }, 0);
      onDragStart(item.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDragOver && !isPageBreak()) {
      onDragOver(item.id);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd && isDraggable()) {
      if (rowRef.current) {
        rowRef.current.classList.remove('opacity-50');
      }
      onDragEnd();
    }
  };

  if (!isEditing) {
    return (
      <tr 
        ref={rowRef}
        className={`${getBgColor()} border-b border-gray-200 ${isPageBreak() ? 'h-6 border-b-2 border-dashed' : ''}`} 
        data-type={item.type}
      >
        <td className="py-1 px-2 text-center w-10">
          {itemNumber && (
            <span className="text-devis font-medium">{itemNumber}</span>
          )}
        </td>
        <td className={`py-1 px-4 ${getTextItemStyles()}`} colSpan={isTextItem() ? 6 : 1}>
          {isPageBreak() ? '- - - - - - - - - - Saut de page - - - - - - - - - -' : item.designation}
          {item.details && !isTextItem() && (
            <div className="text-sm text-devis-lighter mt-1 whitespace-pre-line">
              {item.details}
            </div>
          )}
        </td>
        {!isTextItem() && (
          <>
            <td className="py-1 px-4 text-right text-devis">{item.quantity || '-'}</td>
            <td className="py-1 px-4 text-center text-devis">{item.unit || '-'}</td>
            <td className="py-1 px-4 text-right text-devis">{item.unitPrice ? `${item.unitPrice.toFixed(2)} €` : '-'}</td>
            <td className="py-1 px-4 text-right text-devis">{item.vat ? `${item.vat} %` : '-'}</td>
            <td className="py-1 px-4 text-right text-devis">
              {item.totalHT.toFixed(2)} €
              {(item.type === 'Titre' || item.type === 'Sous-titre') && (
                <div className="text-sm text-devis-light">Sous-total : {item.totalHT.toFixed(2)} €</div>
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
          <td className="py-1 px-2">
            <div className="flex items-center text-devis font-medium">
              {itemNumber}
            </div>
          </td>
          <td className="py-1 px-4" colSpan={6}>
            <div className="flex items-center w-full">
              <Input
                name="designation"
                value={editedItem.designation}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full form-control-devis"
                placeholder={`Saisissez votre ${item.type?.toLowerCase() || 'texte'} ici...`}
                autoFocus
              />
              <Button 
                size="sm" 
                variant="ghost" 
                className="ml-2 text-blue-600 p-1" 
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
        <td className="py-1 px-2">
          <div className="flex items-center text-devis font-medium">
            {itemNumber}
          </div>
        </td>
        <td className="py-1 px-4">
          <Input
            name="designation"
            value={editedItem.designation}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full form-control-devis"
          />
        </td>
        <td className="py-1 px-4">
          <Input
            name="quantity"
            type="number"
            value={editedItem.quantity}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="input-quantity form-control-devis"
          />
        </td>
        <td className="py-1 px-4">
          <select
            name="unit"
            value={editedItem.unit}
            onChange={handleChange}
            className="input-unit form-control-devis border border-gray-300 rounded text-sm p-1"
          >
            <option value="m²">m²</option>
            <option value="u">u</option>
            <option value="ml">ml</option>
            <option value="kg">kg</option>
          </select>
        </td>
        <td className="py-1 px-4">
          <Input
            name="unitPrice"
            type="number"
            step="0.01"
            value={editedItem.unitPrice}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="input-price form-control-devis"
          />
        </td>
        <td className="py-1 px-4">
          <select
            name="vat"
            value={editedItem.vat}
            onChange={handleChange}
            className="input-vat form-control-devis border border-gray-300 rounded text-sm p-1"
          >
            <option value="0">0 %</option>
            <option value="10">10 %</option>
            <option value="20">20 %</option>
          </select>
        </td>
        <td className="py-1 px-4 text-right">
          {(editedItem.quantity * editedItem.unitPrice).toFixed(2)} €
          <Button 
            size="sm" 
            variant="ghost" 
            className="ml-2 text-blue-600 p-1" 
            onClick={handleSave}
          >
            <Check className="h-4 w-4" />
          </Button>
        </td>
      </tr>
    );
  }

  return (
    <tr 
      ref={rowRef}
      data-type={item.type} 
      className={`${getBgColor()} border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${isDragged ? 'opacity-50' : ''} ${isPageBreak() ? 'h-6 border-b-2 border-dashed' : ''}`} 
      onClick={handleEdit}
      draggable={isDraggable()}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <td className="py-1 px-2 text-devis text-center w-6">
        {isDraggable() && (
          <span className="drag-handle flex justify-center text-devis-light">
            <GripVertical className="h-4 w-4" />
          </span>
        )}
        {itemNumber && (
          <span className="text-devis font-medium">{itemNumber}</span>
        )}
      </td>
      <td className={`py-1 px-4 ${getTextItemStyles()}`} colSpan={isTextItem() ? 6 : 1}>
        {isPageBreak() ? '- - - - - - - - - - Saut de page - - - - - - - - - -' : item.designation}
        {item.details && !isTextItem() && (
          <div className="text-sm text-devis-lighter mt-1 whitespace-pre-line">
            {item.details}
          </div>
        )}
      </td>
      {!isTextItem() && (
        <>
          <td className="py-1 px-4 text-right text-devis">{item.quantity || '-'}</td>
          <td className="py-1 px-4 text-center text-devis">{item.unit || '-'}</td>
          <td className="py-1 px-4 text-right text-devis">{item.unitPrice ? `${item.unitPrice.toFixed(2)} €` : '-'}</td>
          <td className="py-1 px-4 text-right text-devis">{item.vat ? `${item.vat} %` : '-'}</td>
          <td className="py-1 px-4 text-right text-devis">
            {item.totalHT.toFixed(2)} €
            {(item.type === 'Titre' || item.type === 'Sous-titre') && (
              <div className="text-sm text-devis-light">Sous-total : {item.totalHT.toFixed(2)} €</div>
            )}
          </td>
        </>
      )}
    </tr>
  );
}

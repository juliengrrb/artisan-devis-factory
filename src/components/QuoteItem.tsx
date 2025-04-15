
import { QuoteItem as QuoteItemType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
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
    // Ensure we have valid numbers before updating
    const updatedItem = {
      ...editedItem,
      quantity: typeof editedItem.quantity === 'string' ? parseFloat(editedItem.quantity) || 0 : editedItem.quantity || 0,
      unitPrice: typeof editedItem.unitPrice === 'string' ? parseFloat(editedItem.unitPrice) || 0 : editedItem.unitPrice || 0,
      vat: typeof editedItem.vat === 'string' ? parseFloat(editedItem.vat) || 0 : editedItem.vat || 0
    };
    
    // Calculate the total
    updatedItem.totalHT = calculateTotalHT(updatedItem.quantity, updatedItem.unitPrice);
    
    onUpdate(updatedItem);
    setIsEditable(false);
  };

  const calculateTotalHT = (quantity: number, unitPrice: number): number => {
    return quantity * unitPrice;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update the edited item
    const updatedItem = {
      ...editedItem,
      [name]: value
    };
    
    // Calculate total if quantity or unitPrice changed
    if (name === 'quantity' || name === 'unitPrice') {
      const quantity = name === 'quantity' ? (value === '' ? 0 : parseFloat(value)) : 
        (typeof editedItem.quantity === 'string' ? parseFloat(editedItem.quantity) || 0 : editedItem.quantity || 0);
        
      const unitPrice = name === 'unitPrice' ? (value === '' ? 0 : parseFloat(value)) : 
        (typeof editedItem.unitPrice === 'string' ? parseFloat(editedItem.unitPrice) || 0 : editedItem.unitPrice || 0);
      
      updatedItem.totalHT = quantity * unitPrice;
    }
    
    setEditedItem(updatedItem);
  };

  // Handle focus on number inputs to clear initial zero values
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.type === 'number' && (e.target.value === '0' || e.target.value === '0.00')) {
      e.target.value = '';
    }
  };

  const getBgColor = () => {
    if (item.type === 'Titre') {
      return 'bg-slate-100';
    } else if (item.type === 'Sous-titre') {
      return 'bg-slate-50';
    } 
    return 'bg-white';
  };

  const isTextItem = () => {
    return ['Titre', 'Sous-titre', 'Texte', 'Saut de page'].includes(item.type || '');
  };

  const getTextItemStyles = () => {
    if (item.type === 'Titre') {
      return 'text-gray-800 font-medium title-row';
    } else if (item.type === 'Sous-titre') {
      return 'text-gray-800 font-medium subtitle-row';
    }
    return 'text-gray-700 item-row';
  };

  const isPageBreak = () => {
    return item.type === 'Saut de page';
  };

  const isDraggable = () => {
    return !isPageBreak() && !isEditable;
  };

  const formatCurrency = (value: number): string => {
    return `${value.toFixed(2)} €`;
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
        className={`${getBgColor()} border-b border-gray-200 ${isPageBreak() ? 'h-6 border-b-2 border-dashed' : 'h-16'}`} 
        data-type={item.type}
      >
        <td className="py-3 px-4 text-center w-10">
          {itemNumber && (
            <span className="text-gray-700 font-medium">{itemNumber}</span>
          )}
        </td>
        <td className={`py-3 px-4 ${getTextItemStyles()}`} colSpan={isTextItem() ? 6 : 1}>
          {isPageBreak() ? '- - - - - - - - - - Saut de page - - - - - - - - - -' : item.designation}
          {item.details && !isTextItem() && (
            <div className="text-sm text-gray-500 mt-1 whitespace-pre-line">
              {item.details}
            </div>
          )}
        </td>
        {!isTextItem() && (
          <>
            <td className="py-3 px-4 text-right text-gray-700 align-middle">{item.quantity || '-'}</td>
            <td className="py-3 px-4 text-center text-gray-700 align-middle">{item.unit || '-'}</td>
            <td className="py-3 px-4 text-right text-gray-700 font-medium text-base align-middle">{item.unitPrice ? formatCurrency(item.unitPrice) : '-'}</td>
            <td className="py-3 px-4 text-center text-gray-700 align-middle">{item.vat ? `${item.vat} %` : '-'}</td>
            <td className="py-3 px-4 text-right text-gray-700 font-medium text-base align-middle">
              {formatCurrency(item.totalHT)}
              {(item.type === 'Titre' || item.type === 'Sous-titre') && (
                <div className="text-sm text-gray-500 mt-1">Sous-total : {formatCurrency(item.totalHT)}</div>
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
        <tr className="bg-white border-b border-gray-200 h-16">
          <td className="py-3 px-4">
            <div className="flex items-center text-gray-700 font-medium">
              {itemNumber}
            </div>
          </td>
          <td className="py-3 px-4" colSpan={6}>
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
      <tr className="bg-white border-b border-gray-200 h-16">
        <td className="py-3 px-4">
          <div className="flex items-center text-gray-700 font-medium">
            {itemNumber}
          </div>
        </td>
        <td className="py-3 px-4">
          <Input
            name="designation"
            value={editedItem.designation}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full form-control-devis"
            placeholder="Saisissez une désignation..."
          />
        </td>
        <td className="py-3 px-4">
          <Input
            name="quantity"
            type="number"
            value={editedItem.quantity?.toString() || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            className="input-quantity form-control-devis w-full"
            placeholder="Qté"
          />
        </td>
        <td className="py-3 px-4">
          <select
            name="unit"
            value={editedItem.unit}
            onChange={handleChange}
            className="input-unit form-control-devis border border-gray-300 rounded text-sm p-2 w-full"
          >
            <option value="m²">m²</option>
            <option value="u">u</option>
            <option value="ml">ml</option>
            <option value="kg">kg</option>
          </select>
        </td>
        <td className="py-3 px-4">
          <Input
            name="unitPrice"
            type="number"
            step="0.01"
            value={editedItem.unitPrice?.toString() || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            className="input-price form-control-devis w-full"
            placeholder="Prix"
          />
        </td>
        <td className="py-3 px-4">
          <select
            name="vat"
            value={editedItem.vat}
            onChange={handleChange}
            className="input-vat form-control-devis border border-gray-300 rounded text-sm p-2 w-full"
          >
            <option value="0">0 %</option>
            <option value="10">10 %</option>
            <option value="20">20 %</option>
          </select>
        </td>
        <td className="py-3 px-4 text-right">
          {formatCurrency(
            (typeof editedItem.quantity === 'string' ? parseFloat(editedItem.quantity) || 0 : editedItem.quantity || 0) * 
            (typeof editedItem.unitPrice === 'string' ? parseFloat(editedItem.unitPrice) || 0 : editedItem.unitPrice || 0)
          )}
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
      className={`${getBgColor()} border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${isDragged ? 'opacity-50' : ''} ${isPageBreak() ? 'h-6 border-b-2 border-dashed' : 'h-16'}`} 
      onClick={handleEdit}
      draggable={isDraggable()}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <td className="py-3 px-4 text-gray-700 w-12 align-middle">
        <div className="flex items-center">
          {isDraggable() && (
            <span className="drag-handle flex justify-center text-gray-400 mr-1 cursor-move">
              <GripVertical className="h-4 w-4" />
            </span>
          )}
          {itemNumber && (
            <span className="text-gray-700 font-medium">{itemNumber}</span>
          )}
        </div>
      </td>
      <td className={`py-3 px-4 ${getTextItemStyles()}`} colSpan={isTextItem() ? 6 : 1}>
        {isPageBreak() ? '- - - - - - - - - - Saut de page - - - - - - - - - -' : item.designation}
        {item.details && !isTextItem() && (
          <div className="text-sm text-gray-500 mt-1 whitespace-pre-line">
            {item.details}
          </div>
        )}
      </td>
      {!isTextItem() && (
        <>
          <td className="py-3 px-4 text-right text-gray-700 align-middle">{item.quantity || '-'}</td>
          <td className="py-3 px-4 text-center text-gray-700 align-middle">{item.unit || '-'}</td>
          <td className="py-3 px-4 text-right text-gray-700 font-medium text-base align-middle">{item.unitPrice ? formatCurrency(item.unitPrice) : '-'}</td>
          <td className="py-3 px-4 text-center text-gray-700 align-middle">{item.vat ? `${item.vat} %` : '-'}</td>
          <td className="py-3 px-4 text-right text-gray-700 font-medium text-base align-middle">
            {formatCurrency(item.totalHT)}
            {(item.type === 'Titre' || item.type === 'Sous-titre') && (
              <div className="text-sm text-gray-500 mt-1">Sous-total : {formatCurrency(item.totalHT)}</div>
            )}
          </td>
        </>
      )}
    </tr>
  );
}


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface QuoteItemProps {
  id: string;
  designation: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  vat?: number;
  totalHT?: number;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

const QuoteItem: React.FC<QuoteItemProps> = ({
  id,
  designation,
  quantity,
  unit,
  unitPrice,
  vat,
  totalHT,
  onUpdate,
  onDelete
}) => {
  return (
    <div className="flex items-center p-2 border-b">
      <div className="w-8 text-gray-500">{id}</div>
      <Input
        value={designation}
        onChange={(e) => onUpdate({ designation: e.target.value })}
        className="flex-1 mx-2"
      />
      <Input
        type="number"
        value={quantity}
        onChange={(e) => onUpdate({ quantity: parseFloat(e.target.value) })}
        className="w-20 mx-2"
      />
      <Input
        value={unit}
        onChange={(e) => onUpdate({ unit: e.target.value })}
        className="w-16 mx-2"
      />
      <Input
        type="number"
        value={unitPrice}
        onChange={(e) => onUpdate({ unitPrice: parseFloat(e.target.value) })}
        className="w-24 mx-2"
      />
      <select
        value={vat}
        onChange={(e) => onUpdate({ vat: parseInt(e.target.value) })}
        className="w-20 mx-2 border rounded p-2"
      >
        <option value="10">10%</option>
        <option value="20">20%</option>
      </select>
      <div className="w-24 text-right font-medium">
        {totalHT?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="ml-2 text-red-500"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuoteItem;

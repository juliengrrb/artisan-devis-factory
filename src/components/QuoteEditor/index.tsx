
import React, { useState } from "react";
import QuoteEditorHeader from "./QuoteEditorHeader";
import QuoteItem from "./QuoteHierarchy";
import { useAppContext } from "@/context/AppContext";

interface QuoteEditorProps {
  quoteId: string;
}

const QuoteEditor: React.FC<QuoteEditorProps> = ({ quoteId }) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [showAppearanceConfig, setShowAppearanceConfig] = useState(false);
  const { quotes, updateQuote } = useAppContext();

  const quote = quotes.find(q => q.id === quoteId);
  
  if (!quote) return null;

  return (
    <div className="h-full flex flex-col">
      <QuoteEditorHeader 
        quoteId={quoteId}
        mode={mode}
        onModeChange={setMode}
        onOpenAppearanceConfig={() => setShowAppearanceConfig(true)}
      />
      
      <div className="flex-1 p-4 bg-gray-50">
        {mode === 'edit' ? (
          <div className="space-y-4">
            {quote.items?.map(item => (
              <QuoteItem
                key={item.id}
                {...item}
                onUpdate={(data) => {
                  const updatedQuote = {
                    ...quote,
                    items: quote.items.map(i => 
                      i.id === item.id ? { ...i, ...data } : i
                    )
                  };
                  updateQuote(updatedQuote);
                }}
                onDelete={() => {
                  const updatedQuote = {
                    ...quote,
                    items: quote.items.filter(i => i.id !== item.id)
                  };
                  updateQuote(updatedQuote);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-4 rounded shadow">
            {/* Interface de prévisualisation à implémenter */}
            <h2 className="text-xl font-semibold mb-4">Prévisualisation du devis</h2>
            {/* Contenu de la prévisualisation */}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteEditor;

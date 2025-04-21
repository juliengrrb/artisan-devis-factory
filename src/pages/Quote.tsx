
import React, { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import InvoiceCreator from "@/components/InvoiceCreator";

// Ce composant fait tout maintenant (création/édition de devis)
export default function Quote() {
  const { currentQuote, createQuote } = useAppContext();

  useEffect(() => {
    // Toujours avoir un devis courant existant pour édition
    if (!currentQuote) createQuote();
  }, [currentQuote, createQuote]);

  // Evite tout l'ancien code, n'affiche que le nouvel éditeur
  return <InvoiceCreator />;
}

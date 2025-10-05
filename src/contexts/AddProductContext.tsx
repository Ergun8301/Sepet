import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AddProductContextType {
  showAddProductModal: boolean;
  openAddProductModal: () => void;
  closeAddProductModal: () => void;
}

const AddProductContext = createContext<AddProductContextType | undefined>(undefined);

export const AddProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const openAddProductModal = () => setShowAddProductModal(true);
  const closeAddProductModal = () => setShowAddProductModal(false);

  return (
    <AddProductContext.Provider value={{ showAddProductModal, openAddProductModal, closeAddProductModal }}>
      {children}
    </AddProductContext.Provider>
  );
};

export const useAddProduct = () => {
  const context = useContext(AddProductContext);
  if (context === undefined) {
    throw new Error('useAddProduct must be used within an AddProductProvider');
  }
  return context;
};

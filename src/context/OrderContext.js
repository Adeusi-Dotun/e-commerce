import React, { createContext, useMemo, useState } from 'react';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  const addOrder = (order) => {
    if (!order || !order.id) return;

    setOrders((prevOrders) => {
      const existingIndex = prevOrders.findIndex((item) => item.id === order.id);

      if (existingIndex !== -1) {
        const updated = [...prevOrders];
        updated[existingIndex] = { ...updated[existingIndex], ...order };
        return updated;
      }

      return [order, ...prevOrders];
    });
  };

  const clearOrders = () => setOrders([]);

  const value = useMemo(
    () => ({
      orders,
      addOrder,
      clearOrders,
    }),
    [orders]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

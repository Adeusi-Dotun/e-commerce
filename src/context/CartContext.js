import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children}) =>{
    const [cartItems, setCartItems] = useState ([]);

    const addToCart = (item) => {
        setCartItems((prev) => {
            const existingItem = prev.find(i => i.id === item.id);

            if(existingItem) {
                return prev.map(i =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity = 1}
                        : i
                );
            }

            return [...prev, {...item, quantity: 1}];
        });
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const cartTotal = cartItems.reduce(
        (sum, item) => sum = item.price * item.quantity,
        0
    );


    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
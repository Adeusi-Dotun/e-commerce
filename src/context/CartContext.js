import React, { createContext, useState } from "react";


export const CartContext = createContext();

export const CartProvider = ({ children }) =>{
    const [cart, setCart] = useState([]);

    const addToCart = (item , vendor) => {-
        setCart((prevCart) => {
            const selectedVendor = vendor || {
                id: item.vendorId,
                name: item.vendorName,
                location: item.vendorLocation,
            };

            if (!selectedVendor?.id) return prevCart;

            const { quantity, ...itemDetails } = item;
            const itemToAdd = {
                ...itemDetails,
                vendorId: selectedVendor.id,
                vendorName: selectedVendor.name,
                vendorLocation: selectedVendor.location,
            };

            const vendorIndex = prevCart.findIndex(
                (v) => v.vendorId === selectedVendor.id
            );

            // Vendor Exists
            if(vendorIndex !== -1) {
                const vendorCart = prevCart[vendorIndex];

                const itemIndex = vendorCart.items.findIndex(
                    (i) => i.id === item.id
                );

                let updatedVendor;

                // Item exists > increase quantity
                if(itemIndex !== -1) {
                    const updatedItems = vendorCart.items.map((i) =>
                        i.id === item.id
                        ? {...i, quantity: i.quantity + 1}
                        :i
                    );

                    updatedVendor = {
                        ...vendorCart,
                        items: updatedItems,
                    };
                }

                // Item does not exist > add it
                else{
                    updatedVendor = {
                        ...vendorCart,
                        items: [...vendorCart.items, {...itemToAdd, quantity:1 }],
                    };
                }

                const updatedCart = [...prevCart];
                updatedCart[vendorIndex] = updatedVendor;
                return updatedCart;
            }

            // Vendor does not exist > create new cart

            return [
                ...prevCart,
                {
                    vendorId: selectedVendor.id,
                    vendorName: selectedVendor.name,
                    vendorLocation: selectedVendor.location,
                    items: [{...itemToAdd, quantity: 1}],
                }
            ];
        });
    };

    const removeFromCart = (itemId, vendorId) => {
        setCart((prevCart) => {
            return prevCart
                .map((vendor) => {
                    if(vendorId && vendor.vendorId !== vendorId) return vendor;

                    const updatedItems = vendor.items
                        .map((item) =>
                            item.id ===itemId
                            ? {...item, quantity: (item.quantity || 1) -1,}
                            : item
                        )
                        .filter((item) => item.quantity > 0 );
                    return {
                        ...vendor,
                        items: updatedItems,
                    };
                })
                .filter((vendor) => vendor.items.length > 0 );
            });
        };

    const deleteFromCart = (itemId, vendorId) => {
        setCart((prevCart) =>
            prevCart
                .map((vendor) => {
                    if (vendorId && vendor.vendorId !== vendorId) return vendor;
                    return {
                        ...vendor,
                        items: vendor.items.filter((item) => item.id !== itemId),
                    };
                })
                .filter((vendor) => vendor.items.length > 0)
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartItems = cart.flatMap((vendor) =>
        vendor.items.map((item) => ({
            ...item,
            vendorId: vendor.vendorId,
            vendorName: vendor.vendorName,
            vendorLocation: vendor.vendorLocation,
        }))
    );

    const cartCount = cartItems
        .reduce((sum, i) => sum + i.quantity, 0);

    const cartTotal = cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
    );
    return (
        <CartContext.Provider value={{
            cart,
            cartItems,
            addToCart,
            removeFromCart,
            deleteFromCart,
            cartCount,
            cartTotal,
            clearCart
        }}
        >
        {children}
        </CartContext.Provider>
    );
};

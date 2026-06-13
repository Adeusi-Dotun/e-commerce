import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_addresses');
      const selected = await AsyncStorage.getItem('selected_address');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAddresses(parsed);
      }
      if (selected) {
        setSelectedAddress(JSON.parse(selected));
      }
    } catch (e) {
      console.error('Error loading addresses:', e);
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (newAddress) => {
    try {
      // If setting as default or if it's the first address, clear other defaults
      const isFirst = addresses.length === 0;
      const shouldBeDefault = newAddress.isDefault || isFirst;
      
      const preparedAddress = {
        ...newAddress,
        isDefault: shouldBeDefault,
      };

      let updated = [];
      if (shouldBeDefault) {
        updated = addresses.map(addr => ({ ...addr, isDefault: false }));
      } else {
        updated = [...addresses];
      }
      
      updated = [...updated, preparedAddress];
      setAddresses(updated);
      await AsyncStorage.setItem('user_addresses', JSON.stringify(updated));
      
      if (shouldBeDefault) {
        await selectAddress(preparedAddress);
      }
    } catch (e) {
      console.error('Error adding address:', e);
    }
  };

  const deleteAddress = async (id) => {
    try {
      const addressToDelete = addresses.find(addr => addr.id === id);
      const updated = addresses.filter(addr => addr.id !== id);
      
      // If we deleted the default address, make the first remaining address the default
      let finalUpdated = [...updated];
      if (addressToDelete && addressToDelete.isDefault && updated.length > 0) {
        finalUpdated = updated.map((addr, idx) => ({
          ...addr,
          isDefault: idx === 0
        }));
      }

      setAddresses(finalUpdated);
      await AsyncStorage.setItem('user_addresses', JSON.stringify(finalUpdated));

      // Update selectedAddress if the deleted address was selected
      if (selectedAddress && selectedAddress.id === id) {
        const newDefault = finalUpdated.find(addr => addr.isDefault);
        if (newDefault) {
          await selectAddress(newDefault);
        } else if (finalUpdated.length > 0) {
          await selectAddress(finalUpdated[0]);
        } else {
          setSelectedAddress(null);
          await AsyncStorage.removeItem('selected_address');
        }
      } else if (addressToDelete && addressToDelete.isDefault && finalUpdated.length > 0) {
        // If the deleted address was default but not currently selected, we still want to keep selectedAddress updated if needed
        const newDefault = finalUpdated.find(addr => addr.isDefault);
        if (newDefault) {
          await selectAddress(newDefault);
        }
      }
    } catch (e) {
      console.error('Error deleting address:', e);
    }
  };

  const selectAddress = async (address) => {
    try {
      setSelectedAddress(address);
      await AsyncStorage.setItem('selected_address', JSON.stringify(address));
    } catch (e) {
      console.error('Error selecting address:', e);
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const updated = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }));
      setAddresses(updated);
      await AsyncStorage.setItem('user_addresses', JSON.stringify(updated));
      
      const newDefault = updated.find(addr => addr.id === id);
      if (newDefault) {
        await selectAddress(newDefault);
      }
    } catch (e) {
      console.error('Error setting default address:', e);
    }
  };

  return (
    <AddressContext.Provider value={{
      addresses,
      selectedAddress,
      loading,
      addAddress,
      deleteAddress,
      selectAddress,
      setDefaultAddress,
      loadAddresses
    }}>
      {children}
    </AddressContext.Provider>
  );
};

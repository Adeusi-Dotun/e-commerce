import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from './AuthContext';

export const AddressContext = createContext();

// DB row -> the object the screens use.
// locationName / address / label are kept as aliases so screens we haven't
// updated yet (AddressManagement, Checkout) keep rendering. Remove them once
// those screens read `addressLine` directly.
const fromRow = (row) => ({
  id: row.id,
  addressLine: row.address_line,
  landmark: row.landmark || '',
  lat: row.lat,
  lng: row.lng,
  isDefault: row.is_default,
  locationName: row.address_line,
  address: row.address_line,
  label: row.address_line,
});

export const AddressProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // The selected address IS the default one. No second piece of state to drift.
  const selectedAddress = addresses.find((a) => a.isDefault) || null;

  const loadAddresses = useCallback(async () => {
    if (!user?.id) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setAddresses((data || []).map(fromRow));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Only one default per user (the unique index enforces it), so clear first.
  const clearDefaults = () =>
    supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true);

  const addAddress = async ({ addressLine, landmark, lat, lng, isDefault }) => {
    if (!user?.id) return { error: new Error('Not signed in') };

    const makeDefault = Boolean(isDefault) || addresses.length === 0;

    if (makeDefault) {
      const { error: clearError } = await clearDefaults();
      if (clearError) return { error: clearError };
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .insert({
        user_id: user.id,
        address_line: addressLine,
        landmark: landmark || null,
        lat: lat ?? null,
        lng: lng ?? null,
        is_default: makeDefault,
      })
      .select()
      .single();

    if (error) return { error };

    const created = fromRow(data);
    setAddresses((prev) => [
      created,
      ...prev.map((a) => (makeDefault ? { ...a, isDefault: false } : a)),
    ]);
    return { error: null };
  };

  const setDefaultAddress = async (id) => {
    if (!user?.id) return { error: new Error('Not signed in') };

    const { error: clearError } = await clearDefaults();
    if (clearError) return { error: clearError };

    const { error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { error };

    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    return { error: null };
  };

  // Kept so existing callers still work: selecting an address makes it the default.
  const selectAddress = (address) => setDefaultAddress(address?.id);

  const deleteAddress = async (id) => {
    if (!user?.id) return { error: new Error('Not signed in') };

    const target = addresses.find((a) => a.id === id);
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { error };

    const remaining = addresses.filter((a) => a.id !== id);
    setAddresses(remaining);

    // Deleted the default? Promote the most recent remaining address.
    if (target?.isDefault && remaining.length > 0) {
      await setDefaultAddress(remaining[0].id);
    }
    return { error: null };
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddress,
        loading,
        addAddress,
        deleteAddress,
        selectAddress,
        setDefaultAddress,
        loadAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};
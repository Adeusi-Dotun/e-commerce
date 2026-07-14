import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '../components/CustomText';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import VendorApplicationScreen from './VendorApplicationScreen';

const PRIMARY = '#FF6B00';

export default function VendorGateScreen({ navigation }) {
  const { user, loading: authLoading } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);

  const fetchApplication = useCallback(async () => {
    if (authLoading) return;

    if (!user?.id) {
      setApplication(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setApplication(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleApplyAgain = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('vendor_applications')
        .delete()
        .eq('id', application.id);

      if (error) throw error;

      await fetchApplication();
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-circle-outline" size={90} color={PRIMARY} />

        <Text style={styles.title}>Sign In Required</Text>

        <Text style={styles.subtitle}>
          Please sign in before applying to become a vendor.
        </Text>

        <Pressable style={styles.button} onPress={() => navigation.navigate('Signin')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  // No application yet
  if (!application) {
    return <VendorApplicationScreen />;
  }

  // Pending
  if (application.status === 'pending') {
    return (
      <View style={styles.center}>
        <Ionicons name="time-outline" size={90} color={PRIMARY} />

        <Text style={styles.title}>Application Under Review</Text>

        <Text style={styles.subtitle}>
          Your application is currently being reviewed. We will notify you once
          a decision has been made.
        </Text>
      </View>
    );
  }

  // Rejected
  if (application.status === 'rejected') {
    return (
      <View style={styles.center}>
        <Ionicons name="close-circle-outline" size={90} color="red" />

        <Text style={styles.title}>Application Rejected</Text>

        <Text style={styles.subtitle}>Reason:</Text>

        <Text style={styles.reason}>
          {application.rejected_reason || 'No reason provided'}
        </Text>

        <Pressable style={styles.button} onPress={handleApplyAgain}>
          <Text style={styles.buttonText}>Apply Again</Text>
        </Pressable>
      </View>
    );
  }

  // Approved
  if (application.status === 'approved') {
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={90} color="green" />

        <Text style={styles.title}>Welcome Vendor!</Text>

        <Text style={styles.subtitle}>Your application has been approved.</Text>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('VendorDashboard')}
        >
          <Text style={styles.buttonText}>Go To Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'white',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },

  reason: {
    marginTop: 10,
    textAlign: 'center',
    color: 'red',
    fontWeight: '600',
  },

  button: {
    marginTop: 24,
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },

  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
});

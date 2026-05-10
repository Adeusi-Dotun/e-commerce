import { AppText as Text } from '../components/CustomText';
import { Pressable, StyleSheet, View, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import CustomHeader from '../components/CustomHeader';
import { useNavigation } from '@react-navigation/native';

const PaymentMethodScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Payment Methods" />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="card" size={48} color="#9C4400" />
          </View>

          <Text style={styles.title}>No payment methods added</Text>
          <Text style={styles.subtitle}>
            Add a debit or credit card to enjoy faster and seamless checkout.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('AddCard')}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.buttonText}>Add Payment Method</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PaymentMethodScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDE3D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D1321',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#5C4A3D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
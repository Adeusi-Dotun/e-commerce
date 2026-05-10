import { AppText as Text } from '../components/CustomText';
import { StyleSheet, View, Pressable, SafeAreaView } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';

const AddressManagementScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <CustomHeader title="Manage Addresses" />

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={48} color="#9C4400" />
          </View>
          
          <Text style={styles.title}>No addresses saved yet</Text>
          <Text style={styles.subtitle}>
            Add an address to start getting deliveries directly to your location on campus.
          </Text>

          <Pressable style={styles.button} onPress={() => navigation.navigate('AddNewAddress')}>
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.buttonText}>Add New Address</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default AddressManagementScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    // Optional shadow for header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2 },
  backButton: {
    padding: 5 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B00' },
  placeholder: {
    width: 34, // Matches the size of back button roughly
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
    elevation: 3 },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDE3D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D1321', // Dark blue-black
    marginBottom: 12,
    textAlign: 'center' },
  subtitle: {
    fontSize: 15,
    color: '#5C4A3D', // Brownish grey
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32 },
  button: {
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8 },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' }
})

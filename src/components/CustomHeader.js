import { AppText as Text } from './CustomText';
import { StyleSheet, View, Pressable } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CustomHeader = ({ title }) => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.header}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FF6B00" />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  )
}

export default CustomHeader

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
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
    width: 34 } })

import { AppText as Text } from '../components/CustomText';
import { StyleSheet, View, TextInput, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons';

const CategoriesScreen = () => {

  const [search, setSearch] = useState('');

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header / Search Bar */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color="#aaa"
              onPress={() => setSearch('')}
              style={{ marginRight: 10 }}
            />
          )}
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.placeholder}>Categories go here 🗂️</Text>
      </View>
    </View>
  )
}

export default CategoriesScreen

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 10 },
  searchIcon: {
    marginHorizontal: 12 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 0 },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center' },
  placeholder: {
    fontSize: 16,
    color: '#aaa' } })
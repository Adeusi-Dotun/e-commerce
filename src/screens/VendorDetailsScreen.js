import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, ScrollView, ImageBackground, Image } from 'react-native';
import { AppText as Text } from '../components/CustomText';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const VendorDetailsScreen = () => {


  const navigation = useNavigation();
  const route = useRoute();
  const { vendor } = route.params || {};

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Popular');

  const categories = ['Popular', 'Rice', 'Grills', 'Drinks', 'Snacks'];

  const menuItems = vendor?.menu || [];

  const { addToCart, removeFromCart, cartItems, cartCount, cartTotal} = useContext(CartContext);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header Image */}
        <ImageBackground
          source={{uri: vendor?.menu?.[0]?.image}}// Food background placeholder
          style={styles.headerImage}
        >
          <View style={styles.headerTopActions}>
            <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View style={styles.headerRightActions}>
              <Pressable style={styles.iconButton}>
                <Ionicons name="share-social" size={22} color="#FFF" />
              </Pressable>
              <Pressable style={styles.iconButton}>
                <Ionicons name="heart-outline" size={22} color="#FFF" />
              </Pressable>
            </View>
          </View>
        </ImageBackground>

        {/* Info Card that overlaps header image */}
        <View style={styles.infoCardContainer}>
            <View style={styles.vendorTitleRow}>
              <Text style={styles.vendorName}>{vendor?.name || 'The Gourmet Kitchen'}</Text>
              <View style={styles.openBadge}>
                <View style={styles.openDot} />
                <Text style={styles.openText}>Open</Text>
              </View>
            </View>
            
            <Text style={styles.descriptionText}>
              {vendor?.description || 'Authentic Nigerian flavors delivered hot to your doorstep.'}
            </Text>

            <View style={styles.statsRow}>
              <Text style={styles.statsText}>⭐ 4.8 (500+ reviews)</Text>
              <Text style={styles.statsDot}>•</Text>
              <View style={styles.timeWrapper}>
                <Ionicons name="time-outline" size={14} color="#555" />
                <Text style={styles.statsText}> 25-35 mins</Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {vendor?.tags?.map((tag, idx) =>(
                <View key={idx} style= {styles.tagBadge}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search menu..."
                placeholderTextColor="#aaa"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
            </View>
        </View>

        {/* Categories Horizontal Scroll */}
        

        {/* Menu Items List */}
        <View style={styles.menuItemsContainer}>
          {menuItems.map((item) => {
            const cartItem = cartItems.find(
              (i) => i.id === item.id && i.vendorId === vendor?.id
            );
            const quantity = cartItem ? cartItem.quantity : 0;
            return (
            <View key={item.id} style={styles.menuItemCard}>
              <Image source={{ uri: item.image }} style={styles.menuItemImage} />
              <View style={styles.menuItemDetails}>
                <Text style={styles.menuItemTitle}>{item.name}</Text>
                <Text style={styles.menuItemDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.menuItemPrice}>₦{item.price}</Text>
              </View>
              <View style={styles.qtyContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.qtyButton,
                    quantity === 0 && { opacity: 0.5 },
                    pressed && quantity > 0 && { opacity: 0.7, transform: [{ scale: 0.95 }] }
                  ]}
                  onPress={() => quantity > 0 && removeFromCart(item.id, vendor?.id)}
                >
                  <Ionicons name="remove" size={16} color="#777" />
                </Pressable>
                <Text style={styles.qtyText}>{quantity}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.qtyButton,
                    styles.qtyBtnPlus,
                    pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
                  ]}
                  onPress={() => addToCart(item, vendor)}
                >
                  <Ionicons name="add" size={16} color="#FFF" />
                </Pressable>
              </View>
              
            </View>
            );
          })}
        </View>

      </ScrollView>

      {/* Floating Cart Button */}
      <View style={styles.floatingCartContainer}>
        <Pressable 
          style={styles.floatingCartBtn}
          onPress={()=> navigation.navigate('Cart')}
          >
           <View>
             <Text style={styles.cartItemCount}>{cartCount} Items</Text>
             <Text style={styles.cartTotalPrice}>#{cartTotal}</Text>
           </View>
           <View style={styles.viewCartAction}>
             <Text style={styles.viewCartText}>View Cart</Text>
             <Ionicons name="cart" size={20} color="#FFF" />
           </View>
        </Pressable>
      </View>
    </View>
  );
};

export default VendorDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9', // Slightly off-white background based on typical designs
  },
  headerImage: {
    width: '100%',
    height: 250, // Adequate size for top banner
  },
  headerTopActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50, // Avoid safe area visually
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCardContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -40, // overlap the image
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  vendorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFFFF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38A169',
    marginRight: 6,
  },
  openText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38A169',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statsText: {
    fontSize: 13,
    color: '#555',
  },
  statsDot: {
    marginHorizontal: 10,
    color: '#CCC',
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryRow: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  tagBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  categoryBadgeActive: {
    backgroundColor: '#B53B18', // Assuming the dark orange branding color
    borderColor: '#B53B18',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  menuItemsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  menuItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative', // For popular ribbon
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#EEE',
    marginRight: 14,
  },
  menuItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  menuItemDesc: {
    fontSize: 13,
    color: '#777',
    marginBottom: 8,
    lineHeight: 18,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B53B18', // Brand secondary/pricing color
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qtyBtnPlus: {
    backgroundColor: '#B53B18', // using screen's brand orange color
    borderWidth: 0,
  },
  qtyText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  popularRibbon: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#B53B18',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    transform: [{ scale: 0.9 }],
  },
  popularRibbonText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  floatingCartBtn: {
    backgroundColor: '#A83B10', // Darker brand orange
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#A83B10',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cartItemCount: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  cartTotalPrice: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  viewCartAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});

import { AppText as Text } from '../components/CustomText';
import {
  StyleSheet,
  Pressable,
  View,
  ScrollView,
  Image,
  TextInput,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const PRIMARY_COLOR = '#FF6B00';
const BG_COLOR = '#F7F5F0';

const CartScreen = () => {
  const navigation = useNavigation();

  const {
    cart,
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    deleteFromCart
  } = useContext(CartContext);

  const isEmpty = cartCount === 0;

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ================= EMPTY CART ================= */}
      {isEmpty ? (
        <View style={styles.emptyCart}>

          <View style={styles.emptyHeader}>
            <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={24} color="#111" />
            </Pressable>

            <Text style={styles.emptyHeaderTitle}>Your Cart</Text>

            <Text style={styles.emptyItemCount}>0 Items</Text>
          </View>

          <ScrollView contentContainerStyle={styles.emptyScrollContent}>

            <View style={styles.emptyIllustrationBg}>
              <View style={styles.emptyMainIcon}>
                <Ionicons name="bag-handle" size={36} color="#FFF" />
              </View>
            </View>

            <Text style={styles.emptyTitle}>Your cart is empty</Text>

            <Text style={styles.emptyDescription}>
              Start adding delicious meals and products from your favourite vendors.
            </Text>

            <Pressable
              style={styles.emptyStartBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.emptyStartBtnText}>Start Shopping</Text>
            </Pressable>

          </ScrollView>
        </View>

      ) : (

        /* ================= LOADED CART ================= */
        <View style={styles.loadedCart}>

          {/* HEADER */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={24} color="#111" />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Your Cart</Text>
              <Text style={styles.headerSubtitle}>
                {cartCount} items
              </Text>
            </View>

            <View style={styles.iconBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#111" />
            </View>
          </View>

          {/* ITEMS */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {cart.map((vendor) => (
              <View key={vendor.vendorId} style={styles.vendorGroup}>
                <View style={styles.groupHeading}>
                  <View style={styles.logo}></View>
                  <View style={styles.rightGroup}>
                    <Text style={{fontSize:15, fontWeight:600}}>{vendor.vendorName}</Text> 
                    <Text style={{fontSize:11.5, fontWeight:400}}>{vendor.vendorLocation}</Text> 
                  </View>  
                </View>
                <View style={styles.divider} />
                <View style={styles.itemsContainer}>
                  {vendor.items.map((item, index) => (
                    <View key={item.id}>
                      <View style={styles.itemsCard}>
                        <View style={styles.itemsCardTop}>
                          <Image source={{uri: item.image}} style={styles.itemImage} />
                          <View style={styles.itemDetails}>
                            <Text style={{fontSize:15, fontWeight:700}}>{item.name}</Text>
                            <Text style={{fontSize:11.5,}}>{item.description}</Text>
                          </View>
                          <Text style={styles.itemPrice}>₦{item.price}</Text>
                        </View>
                        <View style={styles.itemsCardBottom}>
                          <View style={styles.qtyContainer}>
                            <Pressable
                              style={({ pressed }) => [
                                styles.qtyButton,
                                item.quantity === 0 && { opacity: 0.5 },
                                pressed && item.quantity > 0 && { opacity: 0.7, transform: [{ scale: 0.95 }] }
                              ]}
                              onPress={() => item.quantity > 0 && removeFromCart(item.id, vendor.vendorId)}
                            >
                              <Ionicons name="remove" size={16} color="#777" />
                            </Pressable>
                            <Text style={styles.qtyText}>{item.quantity}</Text>
                            <Pressable
                              style={({ pressed }) => [
                                styles.qtyButton,
                                styles.qtyBtnPlus,
                                pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
                              ]}
                              onPress={() => addToCart(item, { id: vendor.vendorId, name: vendor.vendorName, location: vendor.vendorLocation })}
                            >
                              <Ionicons name="add" size={16} color="#FFF" />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                      {index < vendor.items.length - 1 && (
                        <View style={styles.itemDivider} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
           

            
            
            
            
          

          </ScrollView>

          {/* CHECKOUT BAR */}
          <View style={styles.bottomNav}>
            
            <View style={styles.checkoutBtn}>
              <View style={styles.checkoutTotal}>
                <Text style={{alignSelf: 'flex-start', fontWeight: 600}}>Total</Text>
                <Text style={styles.checkoutTotalPrice}>₦{cartTotal.toFixed(2)}</Text>
              </View>
              <Pressable onPress={() => navigation.navigate('Checkout')} style={styles.checkout}>
                <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              </Pressable>
            </View>
          </View>

        </View>
      )}

    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  loadedCart:{
    flex:1,
  },
  // ── Empty Cart Styles ──
  emptyCart: {
    flex: 1,
  },
  emptyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(247, 245, 240, 0.9)',
  },
  emptyHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
  emptyItemCount: {
    fontSize: 14,
    color: '#888',
  },
  emptyScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 60,
  },
  emptyIllustrationWrapper: {
    marginBottom: 36,
  },
  emptyIllustrationBg: {
    width: 180,
    height: 180,
    borderRadius: 36,
    backgroundColor: '#F3EDE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMainIcon: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  emptyFloatingIcon: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyFloatingTopRight: {
    top: 14,
    right: 10,
    backgroundColor: '#5B9BD5',
  },
  emptyFloatingBottomLeft: {
    bottom: 26,
    left: 6,
    backgroundColor: '#5B9BD5',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
    maxWidth: 280,
  },
  emptyStartBtn: {
    width: '100%',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyStartBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyFavBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  emptyFavBtnText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(247, 245, 240, 0.9)',
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  
  bottomNav: {
    backgroundColor: 'rgba(247, 245, 240, 0.95)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    gap: 10,
  },
  orderSummary: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    gap: 5,
  },
  summaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  checkoutBtn:{
    backgroundColor: 'white',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  checkout:{
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnText:{
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutTotal:{
    alignItems:'center',
    gap:4
  },
  checkoutTotalPrice:{
    fontSize:15,
    fontWeight:700,
    color: 'black'
  },
  vendorGroup:{
    backgroundColor:'white',
    borderRadius:30,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginHorizontal: 16,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginHorizontal: 10,
    opacity: 0.6,
  },
  groupHeading:{
    flexDirection:'row',
    padding:10,
    gap:20

  },
  logo:{
    width:40,
    height:40,
    backgroundColor:'black',
    borderRadius:'100%',
  },
  itemsContainer:{
    backgroundColor:'rgba(255, 255, 255, 0.8)',
    padding:10,
    gap:20,
  },
  itemsCardTop:{
    flexDirection:'row',
  },
  itemImage:{
    width:40,
    height:40,
    backgroundColor:'yellow'
  },
  itemsCardBottom:{
    flexDirection:'row',
    alignItems: 'center',
    justifyContent:'space-between'
  },
  itemsCard:{
    gap:20,
    paddingRight:10
  },
  itemPrice:{
    fontWeight:600,
    marginRight: 20
  },
  itemDetails:{
    marginLeft:12,
    flex: 1,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#B53B18',
    borderWidth: 0,
  },
  qtyText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  }

 
});

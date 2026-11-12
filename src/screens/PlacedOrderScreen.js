import { AppText as Text } from '../components/CustomText';
import React, { useRef, useEffect, useContext, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  SafeAreaView,
  Platform,
  Animated,
  Share,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { CartContext } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import {
  formatNaira,
  getVendorAccent,
  getVendorInitials,
  getEstimatedDelivery,
} from '../utils/orders';

const BG = '#F7F5F0';
const PRIMARY = '#B53B18';
const TEXT_COLOR = '#1A1612';
const TEXT_MUTED = '#6B6560';
const TEXT_LIGHT = '#9A948C';
const CARD = '#FFFFFF';
const BORDER = 'rgba(26, 22, 18, 0.06)';
const SHADOW = 'rgba(26, 22, 18, 0.08)';
const SUCCESS_GREEN = '#2D6A4F';
const PROMO_RED = '#C0392B';

const SurfaceCard = ({ children, style }) => (
  <View style={[styles.surfaceCard, style]}>{children}</View>
);

const AnimatedCheck = () => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[styles.checkCircle, { transform: [{ scale }], opacity }]}
    >
      <Ionicons name="checkmark" size={36} color="#FFF" />
    </Animated.View>
  );
};

const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

// Returns the first image URL from an array, a JSON string, or a plain URL string
const getFirstImage = (images) => {
  if (!images) return null;
  if (Array.isArray(images)) return images[0] ?? null;
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] ?? null : parsed;
    } catch {
      return images;
    }
  }
  return null;
};

// ── Main screen ──
const PlacedOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { clearCart } = useContext(CartContext);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const deliveryRef = useRef(getEstimatedDelivery());
  const hasClearedCartRef = useRef(false);
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const estimatedDelivery = deliveryRef.current;

  // Block back navigation on this screen
  useEffect(() => {
    const onBackPress = () => true;
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK' || e.data.action.type === 'POP') {
        e.preventDefault();
      }
    });

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!hasClearedCartRef.current) {
      clearCart();
      hasClearedCartRef.current = true;
    }
  }, [clearCart]);

  // Fetch the real order from Supabase
  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total,
          status,
          delivery_address,
          created_at,
          order_packages (
            id,
            vendor_id,
            status,
            subtotal,
            vendors ( id, name ),
            order_items (
              id,
              product_id,
              name,
              price,
              quantity,
              products ( images )
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {

        setFetchError(error.message);
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  // Map DB rows to the shape the UI uses
  const packages = (order?.order_packages ?? []).map((pkg) => ({
    vendorId: pkg.vendor_id,
    vendorName: pkg.vendors?.name ?? 'Vendor',
    status: pkg.status ?? 'pending',
    subtotal: Number(pkg.subtotal),
    items: (pkg.order_items ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      image: getFirstImage(item.products?.images), // use your real column name
      price: Number(item.price),
      quantity: item.quantity,
    })),
  }));

  const subtotal = packages.reduce((sum, p) => sum + p.subtotal, 0);
  const totalPaid = Number(order?.total ?? 0);
  const feesTotal = Math.max(totalPaid - subtotal, 0); // delivery + service - discount
  const displayOrderId = order ? `#${order.order_number}` : '';

  const handleShareOrder = async () => {
    try {
      await Share.share({
        message: `I just placed an order on Unilag Marketplace! 🎉\nOrder ID: ${displayOrderId}\nTotal: ${formatNaira(totalPaid)}`,
      });
    } catch (e) {
      // share cancelled
    }
  };

  // ── Loading / error states (must come after all hooks) ──
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center' }]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={PRIMARY} />
      </SafeAreaView>
    );
  }

  if (fetchError || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={{ padding: 24 }}>
          <Text style={styles.heroTitle}>Payment received</Text>
          <Text style={{ color: TEXT_MUTED, marginVertical: 12 }}>
            We couldn't load your order details right now. You can find it in
            My Orders.
          </Text>
          <Pressable onPress={() => navigation.navigate('MyOrders')}>
            <Text style={{ color: PRIMARY }}>Go to My Orders</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Confirmed</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Success hero ── */}
        <View style={styles.heroSection}>
          <AnimatedCheck />
          <Animated.View style={{ opacity: fadeIn, alignItems: 'center' }}>
            <Text style={styles.heroTitle}>Order Placed{'\n'}Successfully</Text>
            <View style={styles.orderIdRow}>
              <Text style={styles.orderIdLabel}>ID: {displayOrderId}</Text>
              <Pressable style={styles.copyBtn} hitSlop={8}>
                <Ionicons name="copy-outline" size={14} color={TEXT_LIGHT} />
              </Pressable>
            </View>
          </Animated.View>
        </View>

        {/* ── Packages section ── */}
        <Animated.View style={{ opacity: fadeIn }}>
          <Text style={styles.sectionTitle}>Your Packages</Text>

          {packages.map((vendor) => (
            <SurfaceCard key={vendor.vendorId} style={styles.packageCard}>
              {/* Vendor header */}
              <View style={styles.vendorHeader}>
                <View
                  style={[
                    styles.vendorAvatar,
                    { backgroundColor: getVendorAccent(vendor.vendorId) },
                  ]}
                >
                  <Text style={styles.vendorAvatarText}>
                    {getVendorInitials(vendor.vendorName)}
                  </Text>
                </View>
                <Text style={styles.vendorName}>{vendor.vendorName}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {capitalize(vendor.status)}
                  </Text>
                </View>
              </View>

              {/* Items */}
              {vendor.items.map((item, index) => (
                <View key={item.id}>
                  {index > 0 && <View style={styles.itemDivider} />}
                  <View style={styles.itemRow}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.itemImage,
                          {
                            backgroundColor: BORDER,
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                        ]}
                      >
                        <Ionicons
                          name="image-outline"
                          size={20}
                          color={TEXT_LIGHT}
                        />
                      </View>
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      {formatNaira(item.price * item.quantity)}
                    </Text>
                  </View>
                </View>
              ))}
            </SurfaceCard>
          ))}

          {/* ── Payment Summary ── */}
          <SurfaceCard style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>Payment Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatNaira(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery & fees</Text>
              <Text style={styles.summaryValue}>{formatNaira(feesTotal)}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <View style={styles.totalValueRow}>
                <Text style={styles.totalValue}>{formatNaira(totalPaid)}</Text>
                <View style={styles.paidCheckIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={SUCCESS_GREEN}
                  />
                </View>
              </View>
            </View>
          </SurfaceCard>
        </Animated.View>

        {/* spacer for bottom CTAs */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom CTAs ── */}
      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.trackOrderBtn,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Ionicons name="cube-outline" size={20} color="#FFF" />
          <Text style={styles.trackOrderText}>Track Order</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.continueBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.continueBtnText}>Continue Shopping</Text>
        </Pressable>

        <Pressable style={styles.shareRow} onPress={handleShareOrder}>
          <Ionicons name="share-social-outline" size={16} color={TEXT_MUTED} />
          <Text style={styles.shareText}>Share your order</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};


export default PlacedOrderScreen;

// ── Styles ──
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: Platform.OS === 'android' ? 28 : 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_COLOR,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderIdLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  copyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Delivery Banner
  deliveryBanner: {
    backgroundColor: CARD,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  deliveryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: SUCCESS_GREEN,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  deliveryDates: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 4,
  },

  // Section title
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 14,
  },

  // Surface card
  surfaceCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },

  // Package card
  packageCard: {
    paddingVertical: 16,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  vendorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  vendorName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: PRIMARY,
  },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EDE9E3',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  itemQty: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 3,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginVertical: 2,
  },

  // Payment card
  paymentCard: {
    marginTop: 10,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  promoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: PROMO_RED,
  },
  promoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: PROMO_RED,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  totalValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT_COLOR,
  },
  paidCheckIcon: {
    marginLeft: 2,
  },
  paymentMethodRow: {
    marginTop: 4,
  },
  paymentMethodText: {
    fontSize: 12,
    color: TEXT_LIGHT,
  },

  // Bottom bar
  bottomBar: {
    backgroundColor: BG,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    gap: 10,
    alignItems: 'center',
  },
  trackOrderBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PRIMARY,
    paddingVertical: 17,
    borderRadius: 28,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  trackOrderText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  continueBtn: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    backgroundColor: 'transparent',
  },
  continueBtnText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '700',
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  shareText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
});

import { AppText as Text } from '../components/CustomText';
import React, { useRef, useEffect, useContext, useMemo } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { OrderContext } from '../context/OrderContext';

// ── Design tokens (matching project palette) ──
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

// ── Helpers ──
const formatNaira = (amount) =>
  `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const getVendorAccent = (id) => {
  const palette = ['#2D4A3E', '#3D4F6F', '#6B4E3D', '#5C3D5A', '#4A5568'];
  return palette[(id || 0) % palette.length];
};

const getVendorInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const generateOrderId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const suffix = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `ORD-2026-${suffix}`;
};

const getEstimatedDelivery = () => {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() + 2);
  const to = new Date(now);
  to.setDate(to.getDate() + 3);
  const fmt = (d) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return { from: fmt(from), to: fmt(to) };
};

const formatOrderDateLabel = (d) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfGiven = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfGiven - startOfToday) / (24 * 60 * 60 * 1000));

  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const datePart =
    diffDays === 0
      ? 'Today'
      : diffDays === -1
        ? 'Yesterday'
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${datePart} • ${time}`;
};

const computeItemsCountFromPackages = (packages = []) =>
  packages.reduce((sum, vendor) => {
    const vendorItems = Array.isArray(vendor?.items) ? vendor.items : [];
    return (
      sum +
      vendorItems.reduce((subSum, item) => subSum + (Number(item?.quantity) || 1), 0)
    );
  }, 0);

const buildOrderPreviewFromPackages = (packages = []) => {
  const names = [];

  packages.forEach((vendor) => {
    const vendorItems = Array.isArray(vendor?.items) ? vendor.items : [];
    vendorItems.forEach((item) => {
      const name = item?.name;
      if (typeof name === 'string' && name.trim().length > 0) names.push(name.trim());
    });
  });

  const top = names.slice(0, 3);
  if (top.length === 0) return 'Your order';
  return names.length > 3 ? `${top.join(' + ')} + ...` : top.join(' + ');
};

const PAYMENT_LABELS = {
  card: 'Card ending in 4242',
  transfer: 'Bank Transfer',
  wallet: 'Wallet Balance',
};

// ── Reusable surface card ──
const SurfaceCard = ({ children, style }) => (
  <View style={[styles.surfaceCard, style]}>{children}</View>
);

// ── Animated checkmark ──
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
      style={[
        styles.checkCircle,
        { transform: [{ scale }], opacity },
      ]}
    >
      <Ionicons name="checkmark" size={36} color="#FFF" />
    </Animated.View>
  );
};

// ── Main screen ──
const PlacedOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addOrder } = useContext(OrderContext);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const orderIdRef = useRef(generateOrderId());
  const deliveryRef = useRef(getEstimatedDelivery());
  const placedAtRef = useRef(new Date());
  const hasSavedOrderRef = useRef(false);

  // Extract data passed from CheckoutScreen
  const {
    packages = [],
    subtotal = 0,
    deliveryFee = 0,
    discount = 0,
    appliedCoupon = null,
    totalPaid = 0,
    selectedPayment = 'card',
  } = route.params || {};

  const orderId = orderIdRef.current;
  const estimatedDelivery = deliveryRef.current;
  const paymentMethodLabel = PAYMENT_LABELS[selectedPayment] || 'Card';
  const placedOrder = useMemo(() => ({
  id: orderId,
  status: 'Ongoing',
  vendors: Array.isArray(packages) ? packages.length : 0,
  items: computeItemsCountFromPackages(packages),
  preview: buildOrderPreviewFromPackages(packages),
  date: formatOrderDateLabel(placedAtRef.current),
  total: totalPaid,
  packages,
  estimatedDelivery,
  driverName: 'Chinedu O.',
}), [orderId, packages, totalPaid, estimatedDelivery]);

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!hasSavedOrderRef.current) {
    addOrder(placedOrder);
    hasSavedOrderRef.current = true;
    }
    
  }, [addOrder, placedOrder]);


  const handleShareOrder = async () => {
    try {
      await Share.share({
        message: `I just placed an order on Unilag Marketplace! 🎉\nOrder ID: ${orderId}\nTotal: ${formatNaira(totalPaid)}`,
      });
    } catch (e) {
      // share cancelled
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={TEXT_COLOR} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Confirmed</Text>
        </View>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={TEXT_MUTED} />
        </Pressable>
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
              <Text style={styles.orderIdLabel}>ID: {orderId}</Text>
              <Pressable style={styles.copyBtn} hitSlop={8}>
                <Ionicons name="copy-outline" size={14} color={TEXT_LIGHT} />
              </Pressable>
            </View>
          </Animated.View>
        </View>

        {/* ── Delivery estimate banner ── */}
        <Animated.View style={[styles.deliveryBanner, { opacity: fadeIn }]}>
          <Text style={styles.deliveryLabel}>ESTIMATED DELIVERY</Text>
          <Text style={styles.deliveryDates}>
            {estimatedDelivery.from} – {estimatedDelivery.to}
          </Text>
        </Animated.View>

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
                  <Text style={styles.statusBadgeText}>Processing</Text>
                </View>
              </View>

              {/* Items */}
              {vendor.items.map((item, index) => (
                <View key={item.id}>
                  {index > 0 && <View style={styles.itemDivider} />}
                  <View style={styles.itemRow}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
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
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{formatNaira(deliveryFee)}</Text>
            </View>

            {appliedCoupon && discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.promoLabel}>
                  Promo Applied ({appliedCoupon.code})
                </Text>
                <Text style={styles.promoValue}>
                  -{formatNaira(discount)}
                </Text>
              </View>
            )}

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <View style={styles.totalValueRow}>
                <Text style={styles.totalValue}>
                  {formatNaira(totalPaid)}
                </Text>
                <View style={styles.paidCheckIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={SUCCESS_GREEN} />
                </View>
              </View>
            </View>

            <View style={styles.paymentMethodRow}>
              <Text style={styles.paymentMethodText}>
                Paid via {paymentMethodLabel}
              </Text>
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

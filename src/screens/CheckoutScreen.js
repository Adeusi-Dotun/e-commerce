import { AppText as Text } from '../components/CustomText';
import React, { useContext, useState } from 'react';
import {View,ScrollView,StyleSheet,Pressable,Image,TextInput,SafeAreaView,Platform,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { CartContext } from '../context/CartContext';

const BG = '#F7F5F0';
const PRIMARY = '#B53B18';
const PRIMARY_SOFT = 'rgba(181, 59, 24, 0.12)';
const TEXT = '#1A1612';
const TEXT_MUTED = '#6B6560';
const TEXT_LIGHT = '#9A948C';
const CARD = '#FFFFFF';
const BORDER = 'rgba(26, 22, 18, 0.06)';
const SHADOW = 'rgba(26, 22, 18, 0.08)';

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Debit Card',
    detail: '•••• 4829',
    icon: 'card',
    badge: 'Default',
  },
  {
    id: 'transfer',
    label: 'Bank Transfer',
    detail: 'Instant confirmation',
    icon: 'swap-horizontal',
  },
  {
    id: 'wallet',
    label: 'Wallet Balance',
    detail: '₦24,500 available',
    icon: 'wallet',
  },
];

const formatNaira = (amount) =>
  `₦${amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const getVendorInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const getVendorAccent = (id) => {
  const palette = ['#2D4A3E', '#3D4F6F', '#6B4E3D', '#5C3D5A', '#4A5568'];
  return palette[(id || 0) % palette.length];
};

const SectionLabel = ({ children, action, onAction }) => (
  <View style={styles.sectionLabelRow}>
    <Text style={styles.sectionLabel}>{children}</Text>
    {action ? (
      <Pressable onPress={onAction} hitSlop={8}>
        <Text style={styles.sectionAction}>{action}</Text>
      </Pressable>
    ) : null}
  </View>
);

const SurfaceCard = ({ children, style }) => (
  <View style={[styles.surfaceCard, style]}>{children}</View>
);

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const { cart, cartCount, cartTotal } = useContext(CartContext);

  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const vendorCount = cart.length;
  const subtotal = cartTotal;
  const deliveryFee = Math.min(800 + vendorCount * 350, 2400);
  const serviceFee = Math.round(subtotal * 0.025);
  const discount = appliedCoupon ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = Math.max(
    0,
    subtotal + deliveryFee + serviceFee - discount
  );

  const estimatedWindow =
    vendorCount > 1 ? '45–65 min · Multi-vendor' : '35–50 min';

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'UNILAG10' || code === 'PREMIUM') {
      setAppliedCoupon({ code, label: '10% off your order' });
    } else if (code.length > 0) {
      setAppliedCoupon(null);
    }
  };

  const itemCountLabel =
    cartCount === 1 ? '1 item' : `${cartCount} items`;

return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={TEXT} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.headerSubtitle}>
            Review your order before payment
          </Text>
        </View>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="help-circle-outline" size={22} color={TEXT_MUTED} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SectionLabel>Delivery</SectionLabel>
        <SurfaceCard>
          <View style={styles.addressRow}>
            <View style={styles.locationPin}>
              <Ionicons name="location" size={20} color={PRIMARY} />
            </View>
            <View style={styles.addressBody}>
              <Text style={styles.addressLabel}>Deliver to</Text>
              <Text style={styles.addressTitle}>Moremi Hall, Room 204</Text>
              <Text style={styles.addressMeta}>
                University of Lagos · Akoka
              </Text>
            </View>
            <Pressable
              style={styles.changeBtn}
              onPress={() => navigation.navigate('AddressManagement')}
            >
              <Text style={styles.changeBtnText}>Change</Text>
            </Pressable>
          </View>

          <View style={styles.notesField}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color={TEXT_LIGHT}
            />
            <TextInput
              style={styles.notesInput}
              placeholder="Delivery notes (gate code, landmark…)"
              placeholderTextColor={TEXT_LIGHT}
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
              multiline
            />
          </View>
        </SurfaceCard>

        <SectionLabel action={itemCountLabel}>
          {`Orders · ${vendorCount} vendor${vendorCount > 1 ? 's' : ''}`}
        </SectionLabel>
        {cart.map((vendor) => (
          <SurfaceCard key={vendor.vendorId} style={styles.vendorCard}>
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
              <View style={styles.vendorMeta}>
                <Text style={styles.vendorName}>{vendor.vendorName}</Text>
                <View style={styles.vendorLocationRow}>
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={TEXT_LIGHT}
                  />
                  <Text style={styles.vendorLocation}>
                    {vendor.vendorLocation}
                  </Text>
                </View>
              </View>
              <View style={styles.vendorBadge}>
                <Text style={styles.vendorBadgeText}>
                  {vendor.items.length} item
                  {vendor.items.length > 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {vendor.items.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <View style={styles.itemDivider} /> : null}
                <View style={styles.orderItem}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.itemThumb}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
                    <Text style={styles.itemQty}>Qty {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    {formatNaira(item.price * item.quantity)}
                  </Text>
                </View>
              </View>
            ))}
          </SurfaceCard>
        ))}

        <SectionLabel
          action="Manage"
          onAction={() => navigation.navigate('paymentMethod')}
        >
          Payment
        </SectionLabel>
        <SurfaceCard style={styles.paymentCard}>
          {PAYMENT_METHODS.map((method, index) => {
            const selected = selectedPayment === method.id;
            return (
              <Pressable
                key={method.id}
                style={[
                  styles.paymentRow,
                  index < PAYMENT_METHODS.length - 1 && styles.paymentRowBorder,
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View
                  style={[
                    styles.paymentIconWrap,
                    selected && styles.paymentIconWrapActive,
                  ]}
                >
                  <Ionicons
                    name={method.icon}
                    size={20}
                    color={selected ? PRIMARY : TEXT_MUTED}
                  />
                </View>
                <View style={styles.paymentBody}>
                  <View style={styles.paymentTitleRow}>
                    <Text style={styles.paymentLabel}>{method.label}</Text>
                    {method.badge ? (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>
                          {method.badge}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.paymentDetail}>{method.detail}</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    selected && styles.radioOuterActive,
                  ]}
                >
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            );
          })}
          <Pressable
            style={styles.addPaymentRow}
            onPress={() => navigation.navigate('AddCard')}
          >
            <Ionicons name="add-circle-outline" size={22} color={PRIMARY} />
            <Text style={styles.addPaymentText}>Add new payment method</Text>
            <Ionicons name="chevron-forward" size={18} color={TEXT_LIGHT} />
          </Pressable>
        </SurfaceCard>

        <SectionLabel>Promo & rewards</SectionLabel>
        <SurfaceCard>
          <View style={styles.promoRow}>
            <View style={styles.promoInputWrap}>
              <Ionicons name="pricetag-outline" size={18} color={TEXT_LIGHT} />
              <TextInput
                style={styles.promoInput}
                placeholder="Enter coupon code"
                placeholderTextColor={TEXT_LIGHT}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
            </View>
            <Pressable style={styles.applyBtn} onPress={handleApplyCoupon}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </Pressable>
          </View>
          {appliedCoupon ? (
            <View style={styles.couponApplied}>
              <Ionicons name="checkmark-circle" size={18} color="#2D6A4F" />
              <Text style={styles.couponAppliedText}>
                {appliedCoupon.code} — {appliedCoupon.label}
              </Text>
            </View>
          ) : (
            <Text style={styles.promoHint}>Try UNILAG10 or PREMIUM</Text>
          )}
        </SurfaceCard>

        <SectionLabel>Order summary</SectionLabel>
        <SurfaceCard>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatNaira(subtotal)}</Text>
          </View>
          {deliveryFee > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>
                {formatNaira(deliveryFee)}
              </Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service fee</Text>
            <Text style={styles.summaryValue}>{formatNaira(serviceFee)}</Text>
          </View>
          {discount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.discountLabel]}>
                Discount
              </Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                −{formatNaira(discount)}
              </Text>
            </View>
          ) : null}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>
              {formatNaira(grandTotal)}
            </Text>
          </View>
        </SurfaceCard>

        <View style={styles.trustRow}>
          <Ionicons name="lock-closed" size={14} color={TEXT_LIGHT} />
          <Text style={styles.trustText}>
            Secure checkout · Encrypted payments
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomGlass}>
        <View style={styles.bottomGlassInner}>
          <View style={styles.bottomLeft}>
            <Text style={styles.bottomLabel}>Total due</Text>
            <Text style={styles.bottomAmount}>{formatNaira(grandTotal)}</Text>
            <Text style={styles.bottomMeta}>
              {vendorCount} vendor{vendorCount > 1 ? 's' : ''} · {itemCountLabel}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.placeOrderBtn,
              pressed && styles.placeOrderBtnPressed,
            ]}
            onPress={() => navigation.navigate('PlacedOrder', {
              packages: cart,
              subtotal,
              deliveryFee,
              discount,
              appliedCoupon,
              totalPaid: grandTotal,
              selectedPayment,
            })}
          >
            <Text style={styles.placeOrderText}>Place Order</Text>
            <View style={styles.placeOrderArrow}>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: Platform.OS === 'android' ? 28 : 0,
  },
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
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  headerSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
    textAlign: 'center',
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 200,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUTED,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
  surfaceCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationPin: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PRIMARY_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressBody: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
  },
  addressMeta: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 3,
    lineHeight: 18,
  },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
  mapStrip: {
    marginTop: 16,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#EDE9E3',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  mapDotGrid: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.4,
    padding: 8,
    gap: 10,
  },
  mapDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TEXT_LIGHT,
  },
  mapPinFloating: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mapEta: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
  },
  notesField: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  notesInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
    fontFamily: 'Inter_400Regular',
    minHeight: 20,
    padding: 0,
  },
  vendorCard: {
    paddingVertical: 16,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  vendorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  vendorMeta: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
  },
  vendorLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  vendorLocation: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  vendorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: BG,
  },
  vendorBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginVertical: 2,
  },
  itemThumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#EDE9E3',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
  },
  itemDesc: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_LIGHT,
    marginTop: 6,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
  },
  paymentCard: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  paymentRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  paymentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconWrapActive: {
    backgroundColor: PRIMARY_SOFT,
  },
  paymentBody: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
  },
  defaultBadge: {
    backgroundColor: PRIMARY_SOFT,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: PRIMARY,
  },
  paymentDetail: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D4CFC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: PRIMARY,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY,
  },
  addPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  addPaymentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BG,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  promoInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
    paddingVertical: 14,
    fontFamily: 'Inter_400Regular',
  },
  applyBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  couponApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 106, 79, 0.08)',
  },
  couponAppliedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D6A4F',
  },
  promoHint: {
    fontSize: 12,
    color: TEXT_LIGHT,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
  },
  discountLabel: {
    color: '#2D6A4F',
  },
  discountValue: {
    color: '#2D6A4F',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: PRIMARY,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  trustText: {
    fontSize: 12,
    color: TEXT_LIGHT,
  },
  bottomGlass: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  bottomGlassInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  bottomLeft: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bottomAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT,
    marginTop: 2,
  },
  bottomMeta: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingLeft: 22,
    paddingRight: 8,
    paddingVertical: 14,
    borderRadius: 18,
    gap: 10,
  },
  placeOrderBtnPressed: {
    opacity: 0.92,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  placeOrderArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG,
  },
  emptyIconRing: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: PRIMARY_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

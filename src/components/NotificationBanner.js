import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text,View,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotifications } from "../context/NotificationsContext";

const NotificationBanner = () => {
  const { currentBanner, dismissNotification } = useNotifications();
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-180)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const isDismissing = useRef(false);

  const dismissBanner = () => {
    if (isDismissing.current || !currentBanner) return;

    isDismissing.current = true;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -180,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        dismissNotification();
      }
    });
  };

  useEffect(() => {
    if (!currentBanner) {
      translateY.setValue(-180);
      opacity.setValue(0);
      return;
    }

    isDismissing.current = false;

    translateY.setValue(-180);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 150,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(dismissBanner, 4000);

    return () => clearTimeout(timer);
  }, [currentBanner?.id]);

  if (!currentBanner) return null;

  const categoryLabels = {
    test: "Test notification",
    order: "Order update",
    order_placed: "Order update",
    order_accepted: "Order update",
    order_preparing: "Order update",
    order_ready: "Order update",
    order_delivered: "Order update",
    order_cancelled: "Order update",
    payment: "Payment update",
    payment_successful: "Payment update",
    new_order: "New order",
  };

  const category =
    categoryLabels[currentBanner.type] || "Marketplace update";

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          top: insets.top + 10,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.banner}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="checkmark"
            size={23}
            color="#16803C"
          />
        </View>

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <Text style={styles.category} numberOfLines={1}>
              {category}
            </Text>

            <View style={styles.dot} />

            <Text style={styles.time}>Just now</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {currentBanner.title}
          </Text>

          <Text style={styles.message} numberOfLines={3}>
            {currentBanner.message}
          </Text>
        </View>

        <Pressable
          onPress={dismissBanner}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          style={styles.closeButton}
        >
          <Ionicons name="close" size={18} color="#777777" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 9999,
    elevation: 9999,
  },

  banner: {
    backgroundColor: "#FAFAF9",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEECE7",
    paddingVertical: 15,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E3F6E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
    paddingRight: 8,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  category: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "500",
    color: "#777777",
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#999999",
    marginHorizontal: 7,
  },

  time: {
    fontSize: 11,
    color: "#999999",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#171717",
    marginBottom: 4,
  },

  message: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#666666",
  },

  closeButton: {
    width: 25,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
});

export default NotificationBanner;
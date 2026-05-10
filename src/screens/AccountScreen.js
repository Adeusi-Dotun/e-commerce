import { AppText as Text } from '../components/CustomText';
import { StyleSheet, Pressable, View, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AccountScreen = () => {

  const navigation = useNavigation();
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <ScrollView
      style={styles.accountPage}
      showsVerticalScrollIndicator={false}
    >
      {/* ── LOGGED OUT VIEW ── */}
      {!isLoggedIn && (
        <View>
          <View style={styles.top}>
            <Text style={{ fontSize: 20, fontWeight: 700 }}>Ready to Shop?</Text>
            <Text style={{ fontSize: 15, color: 'grey', lineHeight: 23 }}>
              Join thousand of shoppers in Nigeria's most vibrant marketplace. Secure, fast and local.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Signin')}
              style={styles.button}
            >
              <Text style={{ color: 'white', fontSize: 15 }}>
                Sign in / Register <Ionicons name="arrow-forward-outline" />
              </Text>
            </Pressable>
          </View>

          <View style={styles.middle}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: 700 }}>Why join us?</Text>
            </View>
            <View style={styles.second}>
              <View style={styles.box}>
                <Ionicons name="receipt-outline" size={25} />
                <Text style={{ fontWeight: 800 }}>Track Orders</Text>
                <Text>Real-Time updates on every delivery.</Text>
              </View>
              <View style={styles.box}>
                <Ionicons name="heart-outline" size={25} />
                <Text style={{ fontWeight: 800 }}>Save Items</Text>
                <Text style={{ color: 'grey' }}>Keep your wishlist synced across devices</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottom}>
            <Text style={{ fontWeight: 500, fontSize: 15, color: 'grey' }}>QUICK SERVICES</Text>
            <View style={styles.boxContainer}>
              <View style={styles.bottomBox}>
                <Ionicons name='help' size={25} />
                <Text style={{ fontWeight: 600, fontSize: 15 }}>Help Center</Text>
              </View>
              <View style={styles.bottomBox}>
                <Ionicons name='headset' size={25} />
                <Text style={{ fontWeight: 600, fontSize: 15 }}>Customer Support</Text>
              </View>
              <View style={styles.bottomBox}>
                <Ionicons name='document' size={25} />
                <Text style={{ fontWeight: 600, fontSize: 15 }}>Terms &amp; Conditions</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ── LOGGED IN VIEW ── */}
      {isLoggedIn && (
        <View style={{ gap: 20 }}>
          <View style={styles.loggedInTop}>
            <View style={styles.avatar} />
            <View style={styles.loggedInTopTexts}>
              <Text style={{ fontSize: 22, fontWeight: 600 }}>Adeusi Adedotun</Text>
              <Text>adeusidotun102@gmail.com</Text>
            </View>
          </View>

          <View style={styles.accountSection}>
            <Text style={{ fontSize: 22, fontWeight: 600 }}>Account</Text>
            <View style={styles.accountSettings}>

              <Pressable
                style={styles.accountTabs}
                onPress={() => navigation.navigate('AccountInfo')}
              >
                <View style={styles.leftTab}>
                  <View style={styles.tabIcon}>
                    <Ionicons name='person-outline' size={18} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 600 }}>Account Information</Text>
                </View>
                <Ionicons name='chevron-forward-outline' size={22} />
              </Pressable>

              <Pressable style={styles.accountTabs}>
                <View style={styles.leftTab}>
                  <View style={styles.tabIcon}>
                    <Ionicons name='receipt-outline' size={20} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 600 }}>My Orders</Text>
                </View>
                <Ionicons name='chevron-forward-outline' size={22} />
              </Pressable>

              <Pressable
                style={styles.accountTabs}
                onPress={() => navigation.navigate('AddressManagement')}
              >
                <View style={styles.leftTab}>
                  <View style={styles.tabIcon}>
                    <Ionicons name='location-outline' size={20} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 600 }}>Address Management</Text>
                </View>
                <Ionicons name='chevron-forward-outline' size={22} />
              </Pressable>

              <Pressable
                style={styles.accountTabs}
                onPress={() => navigation.navigate('paymentMethod')}
              >
                <View style={styles.leftTab}>
                  <View style={styles.tabIcon}>
                    <Ionicons name='card-outline' size={20} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 600 }}>Payments Method</Text>
                </View>
                <Ionicons name='chevron-forward-outline' size={22} />
              </Pressable>

              <Pressable style={[styles.accountTabs, { borderBottomWidth: 0 }]}>
                <View style={styles.leftTab}>
                  <View style={styles.tabIcon}>
                    <Ionicons name='lock-closed-outline' size={20} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 600 }}>Password Manager</Text>
                </View>
                <Ionicons name='chevron-forward-outline' size={22} />
              </Pressable>

            </View>
          </View>

          <View style={styles.accountSection}>
            <Text style={{ fontSize: 22, fontWeight: 600 }}>General</Text>
            <View style={styles.accountSettings}>

              <Pressable style={styles.accountTabs}>
                <View style={styles.leftTab}>
                  <View style={styles.tabIcon}>
                    <Ionicons name='chatbubble-ellipses-outline' size={18} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 600 }}>Help Center</Text>
                </View>
                <Ionicons name='chevron-forward-outline' size={22} />
              </Pressable>

              <Pressable style={styles.accountTabs}>
                <View style={styles.leftTab}>
                  <View style={styles.tabIcon}>
                    <Ionicons name='alert-circle-outline' size={20} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 600 }}>Report an Issue</Text>
                </View>
                <Ionicons name='chevron-forward-outline' size={22} />
              </Pressable>

              <Pressable style={styles.accountTabs}>
                <View style={styles.leftTab}>
                  <View style={styles.tabIcon}>
                    <Ionicons name='settings-outline' size={20} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 600 }}>App Settings</Text>
                </View>
                <Ionicons name='chevron-forward-outline' size={22} />
              </Pressable>

              <Pressable style={styles.accountTabs}>
                <View style={styles.leftTab}>
                  <View style={styles.tabIcon}>
                    <Ionicons name='shield-checkmark-outline' size={20} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 600 }}>Privacy Policy</Text>
                </View>
                <Ionicons name='chevron-forward-outline' size={22} />
              </Pressable>

              <Pressable style={[styles.accountTabs, { borderBottomWidth: 0 }]}>
                <View style={styles.leftTab}>
                  <View style={styles.tabIcon}>
                    <Ionicons name='document-text-outline' size={20} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 600 }}>Terms and Condition</Text>
                </View>
                <Ionicons name='chevron-forward-outline' size={22} />
              </Pressable>

            </View>
          </View>

          <Pressable
            onPress={() => setIsLoggedIn(false)}
            style={styles.logOut}
          >
            <Ionicons name='log-out-outline' size={20} />
            <Text style={{ fontSize: 18, fontWeight: 600 }}>Log out</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({

  accountPage: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  top: {
    gap: 10,
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    borderBottomColor: 'orange',
    borderBottomWidth: 5,
  },
  button: {
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  middle: {
    gap: 10,
    marginTop: 20,
  },
  second: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    backgroundColor: 'white',
    width: 150,
    gap: 10,
    padding: 10,
    borderRadius: 20,
  },
  bottom: {
    marginTop: 35,
    gap: 20,
  },
  boxContainer: {
    gap: 15,
  },
  bottomBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 15,
  },
  loggedInTop: {
    padding: 10,
    paddingLeft: 20,
    borderRadius: 45,
    flexDirection: 'row',
    gap: 30,
    alignItems: 'center',
  },
  loggedInTopTexts: {
    gap: 6,
  },
  avatar: {
    height: 55,
    width: 55,
    backgroundColor: 'rgba(200, 200, 200, 0.6)',
    borderRadius: 100,
    opacity: 0.3,
  },
  accountSection: {
    gap: 10,
  },
  accountTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.4)',
    paddingHorizontal: 10,
  },
  leftTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  tabIcon: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountSettings: {
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  logOut: {
    backgroundColor: 'rgba(255, 107, 0, 0.9)',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
});
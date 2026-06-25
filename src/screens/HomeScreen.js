import { AppText as Text } from '../components/CustomText';
import { StyleSheet, View, TextInput, Pressable, ScrollView, Image, Dimensions } from 'react-native'
const { width } = Dimensions.get('window');
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { vendors } from '../data/vendor';

const HomeScreen = () => {

  const navigation = useNavigation();
  const [search, setSearch] = useState('');


  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome  <Text style={{ fontSize: 18 }}>👏</Text></Text>
        <Text style={styles.title}>What do you need today?</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Vendors, item or services"
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
        <View style={styles.freeDelivery}>
          <Text style={{fontSize:25, fontWeight:'500'}}>Free delivery!</Text>
          <Text style={{fontSize:14, fontWeight:'300'}}>On your first order today</Text>
          <Pressable
            onPress={()=>{}}
            style={styles.orderBtn}
            >
              <Text style={{fontWeight:'600', color:'white'}}>Order Now</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.vendorBanner}
          onPress={() => navigation.navigate('VendorApplication')}
        >
          <View style={styles.vendorBannerTexts}>
            <Text style={styles.vendorBannerTitle}>Sell on UniMart</Text>
            <Text style={styles.vendorBannerSubtitle}>Apply to become a vendor today</Text>
          </View>
          <View style={styles.vendorBannerIcon}>
            <Ionicons name="storefront-outline" size={28} color="#FF6B00" />
          </View>
        </Pressable>
        <View style={styles.category}>
          <View style={styles.categoryTop}>
            <Text style={{fontSize:16, fontWeight:'900'}}>Categories</Text>
            <Pressable
              onPress={()=>{}}
              >
            <Text style={{fontSize:16, fontWeight:'500'}}>See all</Text>
            </Pressable>
          </View>
          <View style={styles.categoryBottom}>
            <View style={styles.categoryCard}>
              <View style={styles.Categories}>
                <Ionicons name='fast-food-outline' size={30}  />
              </View>
              <Text style={{fontWeight:'600' }}> Food</Text>
            </View>
            <View style={styles.categoryCard}>
              <View style={styles.Categories}>
                <Ionicons name='shirt-outline' size={30}/>
              </View>
              <Text style={{fontWeight:'600' }}>Clothing</Text>
            </View>
            <View style={styles.categoryCard}>
              <View style={styles.Categories}>
                <Ionicons name="bag-outline" size={28} />
              </View>
              <Text style={{fontWeight:'600'}}>Fashion</Text>
            </View>
            <View style={styles.categoryCard}>
              <View style={styles.Categories}>
                <Ionicons name="medkit-outline" size={28} />
              </View>
              <Text style={{fontWeight:'600'}}>Pharmacy</Text>
            </View>
          </View>
        </View>

        <View style={styles.popularVendors}>
          <View style={styles.popularVendorsTop}>
            <Text style={{fontSize:20, fontWeight:'600'}}>Featured Vendors</Text>
            <Ionicons name='arrow-forward-outline' size={30} color={'rgba(255, 107, 0, 0.8)'}  />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularListing}>
            {vendors.map((vendor) =>(
              <Pressable 
                key={vendor.id} 
                style={styles.vendorCards}
                onPress={() => navigation.navigate('VendorDetails', { vendor })}
              >
                <View style={styles.imageContainer}>
                  {/* Safely get the first menu item's image, or fallback to default */}
                  <Image source={{uri: vendor.menu?.[0]?.image || 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800&q=80'}} style={styles.vendorPic} />
                  
                  <View style={styles.topRatedBadge}>
                    <Ionicons name="star" size={12} color="#A83B10" />
                    <Text style={styles.topRatedText}>Top Rated</Text>
                  </View>

                  <Pressable style={styles.heartBtn} onPress={(e) => { e.stopPropagation(); /* Handle heart press */ }}>
                    <Ionicons name="heart-outline" size={18} color="#A83B10" />
                  </Pressable>
                </View>

                <View style={styles.vendorDetails}>
                  <Text style={styles.vendorName}>{vendor.name}</Text>
                  <Text style={styles.vendorDescription}>{vendor.description}</Text>
                  
                  {vendor.tags && vendor.tags.length > 0 && (
                     <Text style={styles.vendorTags}>{vendor.tags.join(' • ')}</Text>
                  )}

                  <View style={styles.statsRow}>
                    <Ionicons name="star-outline" size={15} color="#A83B10" />
                    <Text style={styles.statsText}> <Text style={{fontWeight:'700', color: '#333'}}>4.8</Text> (500+)</Text>
                  </View>

                  <View style={styles.statsRow}>
                    <Text><Ionicons name="location-outline" size={15} color="#555" /> {vendor.location}</Text>
                  </View>

                  <View style={styles.badgesRow}>
                    <View style={styles.pillBudget}>
                      <Text style={styles.pillBudgetText}>Budget Friendly</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView> 
            
             
           
          

        </View>
      

    </ScrollView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16 
  },
  header: {
    gap: 4 
  },

  greeting: {
    fontSize: 20,
    color: '#888',
    fontWeight: '600' 
  },
  title: {
    fontSize: 35,
    fontWeight: '700',
    color: '#111',
    marginBottom: 14 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 11 
  },
  searchIcon: {
    marginHorizontal: 12 
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 0 },
  category:{
    marginTop:25,
    gap:30
  },
  categoryTop:{
    flexDirection:'row',
    justifyContent:'space-between' 
  },
  Categories:{
    width:60,
    height:60,
    borderRadius:100,
    borderWidth: 'none',
    alignItems:'center',
    justifyContent:'center'
  },
  categoryBottom: {
    flexDirection:'row',
    justifyContent:'space-between',
    width:'100%'
  },
  categoryCard:{
    alignItems:'center',
    gap:10
  },
  freeDelivery:{
    backgroundColor:'rgba(255, 107, 0, 0.8)',
    borderRadius:15,
    padding:10,
    gap:7,
    marginTop:20
  },
  vendorBanner: {
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  vendorBannerTexts: {
    gap: 4,
  },
  vendorBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  vendorBannerSubtitle: {
    fontSize: 13,
    color: 'grey',
  },
  vendorBannerIcon: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBtn:{
    backgroundColor:'rgba(255, 107, 0, 0.8)',
    padding:15,
    alignSelf: 'flex-start',
    borderRadius: 8 
  },
  popularVendors:{
    marginTop: 30,
    gap:15,
  },
  popularVendorsTop:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginBottom: 10,
  },
  vendorCards:{
    backgroundColor:'#FFF',
    width: width * 0.85,
    borderRadius:24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 10
  },
  imageContainer: {
    width: '100%',
    height: 150,
    position: 'relative'
  },
  vendorPic:{
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topRatedBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4
  },
  topRatedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333'
  },
  heartBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#FFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  vendorDetails:{
    padding: 20,
  },
  vendorName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6
  },
  vendorDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 14
  },
  vendorTags: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  statsText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6
  },
  statsDot: {
    color: '#CCC',
    marginHorizontal: 8
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  pillFast: {
    backgroundColor: '#FDECEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  pillFastText: {
    color: '#A83B10',
    fontSize: 12,
    fontWeight: '700'
  },
  pillBudget: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  pillBudgetText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600'
  },
  popularListing:{
    flexDirection:'row',
    gap:20,
    paddingBottom: 20
  }

    
})

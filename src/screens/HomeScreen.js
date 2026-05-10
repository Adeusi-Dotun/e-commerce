import { AppText as Text } from '../components/CustomText';
import { StyleSheet, View, TextInput, Pressable, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

const HomeScreen = () => {

  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const vendors = [
    {
      id:1,
      name: 'Adeola Kitchen',
      location: 'Moremi Hall',
      description: 'Homemade meals and small chops.',
    },
    {
      id:2,
      name: 'Campus Drip',
      locaton: 'Biobaku Hall',
      description:'Affordable Fashion Wears.',
    },
    {
      id: 3,
      name: 'Ten Thrift Store',
      location:'Main Campus',
      description: 'Affordable, trendy thrift wears'
    },
  ]

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
            <Text style={{fontSize:20, fontWeight:'500'}}>Featured Vendors</Text>
            <Ionicons name='arrow-forward-outline' size={30} color={'rgba(255, 107, 0, 0.8)'}  />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularListing}>
            {vendors.map((vendor) =>(
              <Pressable 
                key={vendor.id} 
                style={styles.vendorCards}
                onPress={() => navigation.navigate('VendorDetails', { vendor })}
              >
                <View style={styles.vendorPic}></View>
                <View style={styles.vendorDetails}>
                  <Text style={{fontWeight:'600'}}>{vendor.name}</Text>
                  <Text style={{fontSize: 12, color: '#666'}}>{vendor.location || vendor.locaton}</Text>
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
    paddingBottom: 16 },
  header: {
    gap: 4 },

  greeting: {
    fontSize: 20,
    color: '#888',
    fontWeight: '600' },
  title: {
    fontSize: 35,
    fontWeight: '700',
    color: '#111',
    marginBottom: 14 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 11 },
  searchIcon: {
    marginHorizontal: 12 },
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
    justifyContent:'space-between' },
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
    justifyContent:'space-between'
  },
  vendorCards:{
    backgroundColor:'white',
    flexDirection:'row',
    alignSelf:'flex-start',
    alignItems:'center',
    padding:10,
    gap:4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    borderRadius:10,
    elevation: 2
  },
  vendorPic:{
    height:50,
    width:50,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    borderRadius:'100%'
  },
  vendorDetails:{
    gap:3
  },
  popularListing:{
    flexDirection:'row',
    gap:10
  }

    
}) 
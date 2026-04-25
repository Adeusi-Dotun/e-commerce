import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

const HomeScreen = () => {

  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  return (
    <View style={styles.screen}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning <Text style={{ fontSize: 18 }}>👏</Text></Text>
        <Text style={styles.title}>What do you need today?</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food, item or services"
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
        <View style={styles.category}>
          <View style={styles.categoryTop}>
            <Text style={{fontSize:16, fontWeight:500}}>Categories</Text>
            <Pressable
              onPress={()=>{}}
              >
            <Text style={{fontSize:16, fontWeight:500}}>See all</Text>
            </Pressable>
          </View>
          <View style={styles.categoryBottom}>
            <View style={styles.categoryCard}>
              <View style={styles.Categories}>
                <Ionicons name='fast-food-outline' size={30}  />
              </View>
              <Text style={{fontWeight:600, }}> Food</Text>
            </View>
            <View style={styles.categoryCard}>
              <View style={styles.Categories}>
                <Ionicons name='shirt-outline' size={30}/>
              </View>
              <Text style={{fontWeight:600,}}>Clothing</Text>
            </View>
            <View style={styles.categoryCard}>
              <View style={styles.Categories}>
                <Ionicons name="bag-outline" size={28} />
              </View>
              <Text style={{fontWeight:600}}>Fashion</Text>
            </View>
            <View style={styles.categoryCard}>
              <View style={styles.Categories}>
                <Ionicons name="medkit-outline" size={28} />
              </View>
              <Text style={{fontWeight:600}}>Pharmacy</Text>
            </View>
          </View>
        </View>
        <View style={styles.freeDelivery}>
          <Text style={{fontSize:33, fontWeight:500}}>Free delivery!</Text>
          <Text style={{fontSize:18, fontWeight:300}}>On your first order today</Text>
          <Pressable
            onPress={()=>{}}
            style={styles.orderBtn}
            >
              <Text style={{fontWeight:600, color:'white'}}>Order Now</Text>
          </Pressable>
        </View>

    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    gap: 4,
  },

  greeting: {
    fontSize: 20,
    color: '#888',
    fontWeight:600,
  },
  title: {
    fontSize: 35,
    fontWeight: '700',
    color: '#111',
    marginBottom: 14,
    
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 11,
  },
  searchIcon: {
    marginHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 0,
  },
  category:{
    marginTop:25,
    gap:30
  },
  categoryTop:{
    flexDirection:'row',
    justifyContent:'space-between',
  },
  Categories:{
    width:60,
    height:60,
    borderRadius:100,
    borderWidth:1,
    borderColor: "rgba(255, 107, 0, 0.2)",
    backgroundColor:'#e6e2e2',
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
    borderRadius:10,
    padding:20,
    gap:7,
    marginTop:20
  },
  orderBtn:{
    backgroundColor:'rgba(255, 107, 0, 0.8)',
    padding:15,
    alignSelf: 'flex-start',
    borderRadius: 8,
  }
})
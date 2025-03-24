import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import { Image, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { GlobalId, setId } from '../Model/Globalid';
import HomeScreen from '../View/HomeScreen';
import LoginScreen from '../View/LoginScreen';
import Database from '../Model/Database';
import PaymentScreen from '../View/PaymentScreen';
import AppointmentScreen from '../View/AppointmentScreen';
import OldAppointmentScreen from '../View/OldAppointmentScreen';


const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {

  const navigation = useNavigation();

  const handleLogout = async () => {
    const result = await Database.logoutUser();
    setId('');
    console.log(result);
    if (result == "başarılı")
      navigation.navigate("LoginScreen");
    else console.log("cikis yapma hatasi");
  }

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>Menü</Text>
      </View>
      <DrawerItemList {...props} />
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Çıkış yap</Text>
      </TouchableOpacity>

    </DrawerContentScrollView>
  );
}


function LogoTitle() {
  return (
    <View style={styles.logoContainer}>
      <Image
        style={styles.logoImage}
        source={require('../assets/paw.png')}
      />
      <Text style={styles.logoText}>PawMonitor</Text>
    </View>
  );
}

function DrawerScreens() {
  return (
    <Drawer.Navigator
      initialRouteName='LoginScreen'
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: 'normal',
        },
        drawerActiveTintColor: '#1c1c1c',
        drawerInactiveTintColor: '#CCCCCC',
      }}
    >
      <Drawer.Screen name="Ana sayfa" component={HomeScreen} options={{ headerTitle: (props) => <LogoTitle {...props} />, headerTitleAlign: 'center', headerStyle: { backgroundColor: "#98daf8" } }} />
      <Drawer.Screen name="Randevu al" component={AppointmentScreen} options={{ headerTitle: (props) => <LogoTitle {...props} />, headerTitleAlign: 'center', headerStyle: { backgroundColor: "#98daf8" } }} />
      <Drawer.Screen name="Geçmiş randevuların" component={OldAppointmentScreen} options={{ headerTitle: (props) => <LogoTitle {...props} />, headerTitleAlign: 'center', headerStyle: { backgroundColor: "#98daf8" } }} />
      <Drawer.Screen name="Ödemelerin" component={PaymentScreen} options={{ headerTitle: (props) => <LogoTitle {...props} />, headerTitleAlign: 'center', headerStyle: { backgroundColor: "#98daf8" } }} />
      <Drawer.Screen name="LoginScreen" component={LoginScreen} options={{ headerTitle: (props) => <LogoTitle {...props} />, headerTitleAlign: 'center', headerStyle: { backgroundColor: "#98daf8" }, headerLeft: () => null, swipeEnabled: false, drawerLabel: () => null, drawerItemStyle: { display: 'none' } }} />

    </Drawer.Navigator>
  );
}

const Router = () => {
  return (
    <NavigationContainer>
      <DrawerScreens />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  logoText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerHeader: {
    height: 80,
    justifyContent: 'center',
    paddingLeft: 20,
    backgroundColor: '#98daf8',
    marginBottom: 30
  },
  drawerHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1c1c',
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  logoutButton: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#9e9e9e',
  },
});

export default Router;
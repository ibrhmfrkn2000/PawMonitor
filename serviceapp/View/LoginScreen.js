import React from "react";
import Database from "../Model/Database";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";


const LoginScreen = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [change, setChange] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSignIn = async () => {
    if (validateEmail(email) && password !== '' && password.length >= 6) {
      const Result = await Database.registerUser(email, password);
      console.log("result bunu donderiyor:", Result);
      if (!Result.error)
        navigation.navigate("Ana sayfa");
      else {console.log("giris yaparken hata oldu knk yine resultta");
        Alert.alert("Lütfen geçerli bir e-posta adresi ve şifre girin.");
      }
    } else {
      Alert.alert("Lütfen geçerli bir e-posta adresi ve şifre girin.");
    }
  };


  const handleLogin = async () => {
    if (validateEmail(email) && password.length >= 6) {
      const Result = await Database.loginUser(email, password);
      console.log("result bunu donderiyor:", Result);
      if (!Result.error)
        navigation.navigate("Ana sayfa");
      else {console.log("giris yaparken hata oldu knk yine resultta");
        Alert.alert("Lütfen geçerli bir e-posta adresi ve şifre girin.");
      }
    } else {
      Alert.alert("Lütfen geçerli bir e-posta adresi ve şifre girin.");
    }
  }

  const ChangeLoginToSign = () => {

    change ? setChange(false) : setChange(true);
  }

  return (
    <View style={style.Conteiner}>

      {loading ? null :
        <TextInput
          style={style.input}
          placeholder="Eposta adresiniz..."
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none" />
      }

      {loading ? null :
        <TextInput
          style={style.input}
          placeholder="Şifrenizi girin..."
          value={password}
          secureTextEntry
          onChangeText={setPassword} />
      }
      {loading ?
        <ActivityIndicator size="large" color="#FFB6C1" style={style.indicator} />
        :
        <TouchableOpacity style={style.buttonstyle} onPress={change ? handleSignIn : handleLogin}>
          <Text style={style.buttonText}>{change ? "Kayıt ol" : "Giriş yap"}</Text>
        </TouchableOpacity>
      }

      {loading ? null :
        <TouchableOpacity style={style.changeControl} onPress={ChangeLoginToSign}>
          <Text style={style.changeControlText}>{change ? "Zaten hesabınız var mı?" : "Hesabınız yoksa hesap oluşturun"}</Text>
        </TouchableOpacity>
      }
    </View>
  );

}

const style = StyleSheet.create({
  Conteiner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  input: {
    height: 45,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: '3%',
    backgroundColor: 'white',
    borderRadius: 5,
    textAlign: 'center'
  },
  buttonstyle: {
    width: '90%',
    height: 50,
    backgroundColor: '#98daf8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  changeControl: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeControlText: {
    color: "#006aaf",
    fontSize: 14,
    fontWeight: '450',
    marginVertical: 4,
  },
  indicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#98daf8',
    borderWidth: 5,
    borderColor: '#FFB6C1',
    padding: 20,
  },
});

export default LoginScreen;
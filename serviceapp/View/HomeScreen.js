import React from "react";
import { useIsFocused } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { useState, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Image, ActivityIndicator } from "react-native";
import { FontAwesome6, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import Database from "../Model/Database";
import { GlobalId } from "../Model/Globalid";

const HomeScreen = () => {

  const isFocused = useIsFocused();

  const [modalVisible, setModalVisible] = useState(false);
  const [petName, setPetName] = useState("");
  const [petAge, setPetAge] = useState(0);
  const [gender, setGender] = useState("Erkek");
  const [species, setSpecies] = useState("");
  const [petRace, setPetRace] = useState("-");
  const [ExUri, setExUri] = useState('');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPets = async () => {
    setLoading(true);
    const fetchedPets = await Database.fetchAllPet(GlobalId);
    console.log("Çekilen hayvanlar:", fetchedPets);
    if (fetchedPets) {
      setPets(fetchedPets);
    } else {
      console.log("Boş array");
      setPets([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isFocused) fetchPets();
  }, [isFocused]);

  const handleAddPet = async () => {
    setLoading(true);
    const photoUrl = await Database.uploadToImgBB(ExUri);
    if (photoUrl.length > 0) {
      const result = await Database.addPetWithPhoto(GlobalId, photoUrl, petName, petAge, gender, species, petRace);
      console.log(result, "Hayvan eklendi");
    }
    setModalVisible(false);
    setLoading(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setExUri(pickerResult.assets[0].uri);
      setTimeout(() => {
        var x = ExUri;
        if (ExUri.length > 0) {
          console.log('set edildikden sonra ExUri:', ExUri);
        }
        else { console.error("olmadı valla", x) }
      }, 500);

      console.log(ExUri);
    }
  };

  return (
    <ScrollView contentContainerStyle={style.container}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, marginLeft: 60 }}>Evcil Hayvanlarınız</Text>

      {loading ? <ActivityIndicator size="large" color="#FFB6C1" style={style.indicator} />
        : pets.map((pet, index) => (
          <View key={index} style={style.petContainer}>
            <Image source={{ uri: pet.petphoto }} style={style.petImage} />
            <View style={style.petDetailsContainer}>
              <Text style={style.petName}>{pet.petname}</Text>
              <Text style={style.petDetails}>Yaş: {pet.petage}</Text>
              <Text style={style.petDetails}>Cinsiyet: {pet.petgender}</Text>
              <Text style={style.petDetails}>Tür: {pet.petspecies}</Text>
              <Text style={style.petDetails}>Irk: {pet.petrace}</Text>
            </View>
          </View>
        ))}
      {loading ? null :
        <TouchableOpacity style={style.buttonstyle} onPress={() => setModalVisible(true)}>
          <FontAwesome6 name="add" size={24} color="black" />
        </TouchableOpacity>
      }
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={style.modalView}>
          <TouchableOpacity style={style.closeButton} onPress={() => setModalVisible(false)}>
            <FontAwesome name="times" size={24} color="black" />
          </TouchableOpacity>
          <Text style={style.modalText}>Evcil hayvanını ekle</Text>

          <TouchableOpacity style={style.AddPhoto} onPress={pickImage}>
            <MaterialIcons name="add-photo-alternate" size={100} color="black" />
          </TouchableOpacity>

          <TextInput
            style={style.input}
            placeholder="İsim"
            value={petName}
            onChangeText={setPetName}
          />
          <TextInput
            style={style.input}
            placeholder="Yaş"
            value={petAge}
            onChangeText={setPetAge}
            keyboardType="numeric"
          />

          <Text style={style.label}>Cinsiyet</Text>
          <Picker
            selectedValue={gender}
            style={style.picker}
            onValueChange={(itemValue, itemIndex) => setGender(itemValue)}
          >
            <Picker.Item label="Erkek" value="Erkek" />
            <Picker.Item label="Dişi" value="Dişi" />
          </Picker>

          <Text style={style.label}>Tür</Text>
          <Picker
            selectedValue={species}
            style={style.picker}
            onValueChange={(itemValue, itemIndex) => setSpecies(itemValue)}
          >
            <Picker.Item label="Kedi" value="Kedi" />
            <Picker.Item label="Köpek" value="köpek" />
            <Picker.Item label="Balık" value="Balık" />
            <Picker.Item label="Hamster" value="Hamster" />
            <Picker.Item label="Kuş" value="Kuş" />
            <Picker.Item label="Tavşan" value="Tavşan" />
            <Picker.Item label="Böcek" value="Böcek" />
            <Picker.Item label="Sürüngen" value="Sürüngen" />
            <Picker.Item label="eklembacaklılar " value="eklembacaklılar " />
          </Picker>

          <Text style={style.label}>Irk</Text>

          <TextInput
            style={style.input}
            placeholder="Irk"
            value={petRace}
            onChangeText={setPetRace}
          />
          {loading ? null :
            <TouchableOpacity style={style.addButton} onPress={handleAddPet}>
              <Text style={style.addButtonText}>Ekle</Text>
            </TouchableOpacity>
          }
        </View>
      </Modal>

    </ScrollView>
  );

}

const style = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  buttonstyle: {
    borderBlockColor: 'black',
    borderWidth: 1,
    padding: '5%',
    borderRadius: 7
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold"
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5
  },
  addButton: {
    backgroundColor: "#2196F3",
    borderRadius: 5,
    padding: 10,
    elevation: 2
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: '37%'
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  AddPhoto: {
    position: 'relative',
    marginBottom: 10
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold"
  },
  picker: {
    height: 50,
    width: 220,
    marginBottom: 15
  },
  petContainer: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    marginLeft: 20
  },
  petDetails: {
    fontSize: 14,
    color: "#555",
    marginLeft: 20
  },
  petDetailsContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  indicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#98daf8',
    borderWidth: 5,
    borderColor: '#FFB6C1',
    padding: 20,
    marginLeft: '36%',
    marginTop: '65%'
  },
});

export default HomeScreen;
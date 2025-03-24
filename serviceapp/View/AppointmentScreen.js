import React, { useState, useEffect } from 'react';
import { Button, View, ScrollView, Modal, StyleSheet, Text, TouchableOpacity, TextInput, ActivityIndicator, Image, Alert } from 'react-native';
import { FontAwesome6, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useIsFocused } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import Database from '../Model/Database';
import { GlobalId } from '../Model/Globalid';

const AppointmentScreen = () => {

  const isFocused = useIsFocused();

  const fetchPets = async () => {
    setLoading(true);
    const fetchedPets = await Database.fetchAllPet(GlobalId);
    console.log("Cekilen hayvanlar:", fetchedPets);
    if (fetchedPets) {
      setSelectPet(fetchedPets);
    } else {
      console.log("Boş array");
      setSelectPet([]);
    }
    setLoading(false);
  }

  const fetchAppointments = async () => {
    setLoading(true);
    const fetchedApp = await Database.fetchAppointment(GlobalId);
    console.log("Cekilen randevular:", fetchedApp);
    if (fetchedApp) {
      setAppointment(fetchedApp);
    }
    else {
      console.log("Bos array");
      setSelectPet([]);
    }
  }

  useEffect(() => {
    if (isFocused) {
      fetchPets();
      fetchAppointments();
      AppointmentCheck();
    }
  }, [isFocused]);


  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [explain, setExplain] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectPet, setSelectPet] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [appointment, setAppointment] = useState([]);
  const [checkAppointment, setCheckAppointment] = useState([]);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setTime(currentTime);
  };


  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: onDateChange,
      mode: 'date',
      is24Hour: true,
    });
  };

  const showTimepicker = () => {
    DateTimePickerAndroid.open({
      value: time,
      onChange: onTimeChange,
      mode: 'time',
      is24Hour: true,
    });
  };

  const appointmentAdd = async () => {
    setLoading(true)
    try {
      const petId = selectedPetId._id;
      const petName = selectedPetId.petname;
      const appDate = new Date(date); 
      appDate.setHours(time.getHours()); 
      appDate.setMinutes(time.getMinutes());
      const result = await Database.GetAppointment(GlobalId, petId, petName, explain, appDate);
      if (result) {
        console.log("Basarili randevu:", result);
      }
    }
    catch (e) {
      console.log(selectedPetId);
      console.error("Randevu alirken hata:", e);
    }
    setLoading(false);
  }

  const addButton = async () => {
    await appointmentAdd();
    setModalVisible(false);
  }

  const AppointmentCheck = async () => {
    const now = new Date();
    appointment.forEach(app => {
      const date = app.appDate;
      const dateObj = new Date(date);

      const oneDayBefore = new Date(dateObj);
      oneDayBefore.setDate(dateObj.getDate() - 1);

      if (now >= oneDayBefore && now < dateObj) {
        const formattedDate = dateObj.toLocaleDateString('tr-TR');
        const formattedTime = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        Alert.alert(
          "Randevu Hatırlatıcı",
          `Randevunuza 1 gün veya daha az kaldı.\nRandevu tarihi:${formattedDate} Saat:${formattedTime}`
        );
      }
    });
  }

  const mergedData = appointment
    .map(app => {
      const pet = selectPet.find(p => p._id === app.petId);
      return pet ? { ...app, petphoto: pet.petphoto, petname: pet.petname } : null;
    })
    .filter(item => item && new Date(item.appDate) > new Date());


  return (
    <ScrollView contentContainerStyle={style.container}>
      <TouchableOpacity style={style.buttonstyle} onPress={() => setModalVisible(true)}>
        <FontAwesome6 name="add" size={24} color="black" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={style.modalView}>
          <TouchableOpacity style={style.closeButton} onPress={() => setModalVisible(false)}>
            <FontAwesome name="times" size={24} color="black" />
          </TouchableOpacity>
          <Text style={style.label}>Randevu ekleyin</Text>

          <Picker
            selectedValue={selectedPetId}
            style={style.picker}
            onValueChange={(itemValue) => setSelectedPetId(itemValue)}>
            {selectPet.map((pet) => (<Picker.Item
              label={pet.petname}
              value={pet}
              key={pet._id} />))}
          </Picker>


          <TextInput
            style={style.input}
            placeholder="Açıklama"
            value={explain}
            onChangeText={setExplain} />

          <View style={style.rowContainer}>
            <TouchableOpacity style={style.dateButton} onPress={showDatepicker}>
              <Text style={style.buttonText}>Tarih Seç</Text>
            </TouchableOpacity>

            <TouchableOpacity style={style.timeButton} onPress={showTimepicker}>
              <Text style={style.buttonText}>Saat Seç</Text>
            </TouchableOpacity>
          </View>
          {loading ? <ActivityIndicator size="large" color="#FFB6C1" /> :
            <TouchableOpacity style={style.Add} onPress={addButton}>
              <Text style={style.buttonText}>Ekle</Text>
            </TouchableOpacity>
          }
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color="#FFB6C1" style={style.indicator} />
      ) : (
        mergedData.map((item, index) => {
          const appDate = new Date(item.appDate);
          const now = new Date();
          const timeDifference = appDate - now;
          const isOneDayLeft = timeDifference > 0 && timeDifference <= 24 * 60 * 60 * 1000;
          return (
            <View
              key={index}
              style={[
                style.petContainer,
                isOneDayLeft && style.oneDayLeftContainer, 
              ]}
            >
              <Image source={{ uri: item.petphoto }} style={style.petImage} />
              <View style={style.petDetailsContainer}>
                <Text style={style.petName}>{item.petname}</Text>
                <Text style={style.petDetails}>Tarih: {appDate.toLocaleDateString('tr-TR')}</Text>
                <Text style={style.petDetails}>Saat: {appDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={style.petDetails}>Açıklama: {item.explain}</Text>
              </View>
            </View>
          );
        })
      )}

    </ScrollView>
  );
};

const style = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  buttonstyle: {
    borderWidth: 1,
    padding: '5%',
    borderRadius: 7,
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#ddd',
    zIndex: 10,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
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
  dateButton: {
    backgroundColor: '#87CEEB',
    padding: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10
  },
  timeButton: {
    backgroundColor: '#87CEEB',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  Add: {
    backgroundColor: '#00FF00',
    padding: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: 220,
    marginBottom: 15
  },
  indicator: {
    marginVertical: 20,
  },
  petContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  oneDayLeftContainer: {
    backgroundColor: '#FFEBEE', // Açık kırmızı arka plan
    borderWidth: 2,
    borderColor: '#FF5252', // Dikkat çekici kenarlık
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  petDetailsContainer: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  petDetails: {
    fontSize: 14,
    color: '#555',
  },
});


export default AppointmentScreen;

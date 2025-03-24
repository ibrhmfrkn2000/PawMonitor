import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Database from "../Model/Database";
import { GlobalId } from "../Model/Globalid";

const OldAppointmentScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    fetchAppointments();
    fetchPets();
  }, [isFocused]);

  const fetchPets = async () => {
    setLoading(true);
    const fetchedPets = await Database.fetchAllPet(GlobalId);
    if (fetchedPets) {
      setPets(fetchedPets);
    } else {
      setPets([]);
    }
    setLoading(false);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    const fetchedAppointments = await Database.fetchAppointment(GlobalId);
    if (fetchedAppointments) {
      setAppointments(fetchedAppointments);
    } else {
      setAppointments([]);
    }
    setLoading(false);
  };

  const oldAppointments = appointments
    .map(app => {
      const pet = pets.find(p => p._id === app.petId);
      return pet
        ? { ...app, petphoto: pet.petphoto, petname: pet.petname }
        : null;
    })
    .filter(item => item && new Date(item.appDate) < new Date());

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FFB6C1" style={styles.indicator} />
      ) : oldAppointments.length > 0 ? (
        oldAppointments.map((item, index) => {
          const appDate = new Date(item.appDate);
          return (
            <View key={index} style={styles.appointmentContainer}>
              <Image source={{ uri: item.petphoto }} style={styles.petImage} />
              <View style={styles.detailsContainer}>
                <Text style={styles.petName}>{item.petname}</Text>
                <Text style={styles.details}>Tarih: {appDate.toLocaleDateString("tr-TR")}</Text>
                <Text style={styles.details}>
                  Saat: {appDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </Text>
                <Text style={styles.details}>Açıklama: {item.explain}</Text>
              </View>
            </View>
          );
        })
      ) : (
        <Text style={styles.noAppointmentsText}>Eski randevular bulunamadı.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  indicator: {
    marginTop: 50,
  },
  appointmentContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  details: {
    fontSize: 16,
    marginBottom: 3,
  },
  noAppointmentsText: {
    fontSize: 18,
    textAlign: "center",
    color: "gray",
    marginTop: 20,
  },
});

export default OldAppointmentScreen;

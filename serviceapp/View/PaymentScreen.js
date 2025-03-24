import React from "react";
import { GlobalId } from "../Model/Globalid";
import { useState, useEffect } from "react";
import Database from "../Model/Database";
import { useIsFocused } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { BarChart } from "react-native-chart-kit";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Dimensions } from "react-native";


const PaymentScreen = () => {

    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedPetId, setSelectedPetId] = useState(null);
    const [selectPet, setSelectPet] = useState([]);
    const [fetchedPayments, setFetchedPayments] = useState([]);
    const [totalPayment, setTotalPayment] = useState(0);
    const [mostSpentPet, setMostSpentPet] = useState(null);
    const [yearlyData, setYearlyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);

    const isFocused = useIsFocused();
    const screenWidth = Dimensions.get("window").width;

    useEffect(() => {
        if (isFocused) {
            fetchPets();
            fetchPayments();
            fetchuserstotalpayment();
        }
    }, [isFocused]);

    const fetchPets = async () => {
        try {
            setSelectPet([]);
            const fetchedPets = await Database.fetchAllPet(GlobalId);
            console.log("Fetched pets:", fetchedPets);
            if (fetchedPets) {
                setSelectPet(fetchedPets);
                if (fetchedPets.length > 0) {
                    const mostSpent = fetchedPets.reduce((prev, curr) => {
                        const prevTotalSpend = parseFloat(prev.totalSpend);
                        const currTotalSpend = parseFloat(curr.totalSpend);
                        return prevTotalSpend > currTotalSpend ? prev : curr;
                    }, fetchedPets[0]);
                    setMostSpentPet(mostSpent);
                }
            } else {
                console.log("Boş array");
                setSelectPet([]);
                setMostSpentPet(null);
            }
        }
        catch (e) {
            console.log("Hayvanlari cekerken hata oluştu:", e);
        }
    }

    const fetchPayments = async () => {
        try {
            const fetchedPayments = await Database.fetchPayment();
            if (fetchedPayments) {
                setFetchedPayments(fetchedPayments);
                processPaymentData(fetchedPayments || []);
            } else {
                console.log("Boş array");
                setFetchedPayments([]);
            }
        }
        catch (e) {
            console.log("Ödemeleri çekerken hata oluştu:", e);
        }
    }

    const fetchuserstotalpayment = async () => {
        try {
            const fetchedPayments = await Database.fetchUserTotalSpend();
            if (fetchedPayments) {
                setTotalPayment(fetchedPayments.totalSpend);
            } else {
                console.log("boş");
                setTotalPayment(0);
            }
        }
        catch (e) {
            console.log("Toplam ödemeyi çekerken hata oluştu:", e);
        }
    }

    const addPayment = async () => {
        try {
            setLoading(true);
            const id = selectedPetId;
            console.log("Ödeme eklemek için seçilen pet id:", id);
            await Database.AddPayment(id, amount);
            setLoading(false);
            setAmount('');
        } catch (e) {
            console.log("Ödeme eklerken hata oluştu:", e);
        }
    }

    const handleAddPayment = () => {
        if (amount === '' || selectedPetId === null) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }
        addPayment();
    }

    const processPaymentData = (payments) => {
        const yearly = {};
        const monthly = {};
        const weekly = {};

        payments.forEach((payment) => {
            const date = new Date(payment.Date);
            if (isNaN(date.getTime())) {
                console.error("Geçersiz tarih formatı:", payment.Date);
                return;
            }

            const year = date.getFullYear();
            const month = `${year}-${date.getMonth() + 1}`; 
            const week = `${year}-W${Math.ceil(date.getDate() / 7)}`; 

            yearly[year] = (yearly[year] || 0) + payment.amount;
            monthly[month] = (monthly[month] || 0) + payment.amount;
            weekly[week] = (weekly[week] || 0) + payment.amount;
        });

        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        const formattedMonthlyData = Object.keys(monthly).map((month) => {
            const [year, monthIndex] = month.split("-");
            return { x: `${monthNames[parseInt(monthIndex) - 1]} ${year}`, y: monthly[month] };
        });

        const formattedWeeklyData = Object.keys(weekly).map((week) => {
            const [year, weekIndex] = week.split("-W");
            return { x: `${weekIndex}. Hafta ${year}`, y: weekly[week] };
        });

        setYearlyData(Object.keys(yearly).map((year) => ({ x: year, y: yearly[year] })));
        setMonthlyData(formattedMonthlyData);
        setWeeklyData(formattedWeeklyData);

        console.log("Yıllık harcamalar:", yearly);
        console.log("Aylık harcamalar:", monthly);
        console.log("Haftalık harcamalar:", weekly);
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>

                <Text style={styles.totaluserpayment}>Toplam veteriner Harcaman: {totalPayment}TL</Text>
                {mostSpentPet && (
                    <View style={styles.mostSpentContainer}>
                        <Image source={{ uri: mostSpentPet.petphoto }} style={styles.petImage} />
                        <Text style={styles.mostSpentText}>
                            En çok harcama yaptığınız hayvan:
                            <Text style={styles.petName}>{mostSpentPet.petname}</Text> {"\n"}
                            Toplam Harcama:
                            <Text style={styles.amount}>{mostSpentPet.totalSpend} TL</Text>
                        </Text>
                    </View>
                )}

                <View style={styles.chartContainer}>
                    <Text style={styles.header}>Yıllık Harcamalar</Text>
                    <BarChart
                        data={{
                            labels: yearlyData.map((item) => item.x), // Yıllar
                            datasets: [{ data: yearlyData.map((item) => item.y) }], // Harcamalar
                        }}
                        width={screenWidth - 20}
                        height={220}
                        yAxisSuffix="TL"
                        chartConfig={chartConfig}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                    />
                </View>

                <View style={styles.chartContainer}>
                    <Text style={styles.header}>Aylık Harcamalar</Text>
                    <BarChart
                        data={{
                            labels: monthlyData.map((item) => item.x),
                            datasets: [{ data: monthlyData.map((item) => item.y) }],
                        }}
                        width={screenWidth - 20}
                        height={220}
                        yAxisSuffix="TL"
                        chartConfig={chartConfig}
                        style={styles.chartStyle}
                    />
                </View>

                
                <View style={styles.chartContainer}>
                    <Text style={styles.header}>Haftalık Harcamalar</Text>
                    <BarChart
                        data={{
                            labels: weeklyData.map((item) => item.x),
                            datasets: [{ data: weeklyData.map((item) => item.y) }],
                        }}
                        width={screenWidth - 20}
                        height={300}
                        yAxisSuffix="TL"
                        chartConfig={chartConfig}
                        style={styles.chartStyle}
                        verticalLabelRotation={20}
                        
                    />
                </View>
                <View style={{ height: 152 }} />
            </ScrollView>
            {loading ? (
                <ActivityIndicator size="large" color="#FFB6C1" style={styles.indicator} />
            ) : (
                <View style={styles.innerContainer}>
                    <Picker
                        selectedValue={selectedPetId}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedPetId(itemValue)}>
                        {selectPet.map((pet) => (
                            <Picker.Item
                                label={pet.petname}
                                value={pet._id}
                                key={pet._id}
                            />
                        ))}
                    </Picker>
                    <TextInput
                        style={styles.input}
                        placeholder="Para miktarını girin..."
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <TouchableOpacity style={styles.addPayButton} onPress={handleAddPayment}>
                        <Text style={styles.addPayButtonText}>Ödeme Ekle</Text>
                    </TouchableOpacity>
                </View>)}
        </View>
    );
}

const chartConfig = {
    backgroundColor: "#f5f5f5",
    backgroundGradientFrom: "#f5f5f5",
    backgroundGradientTo: "#f5f5f5",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`, 
    labelColor: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`, 
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726",
    },
    propsForBackgroundLines: {
      stroke: "#e3e3e3",
      strokeDasharray: "", 
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: "bold",
    },
  }

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    innerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 70,
        width: '100%',
        height: '7%',
    },
    input: {
        width: '90%',
        height: 40,
        borderColor: 'black',
        borderRadius: 7,
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
    },
    addPayButton: {
        width: '90%',
        padding: '3%',
        borderRadius: 7,
        backgroundColor: 'black',
        alignItems: 'center',
    },
    addPayButtonText: {
        color: 'white',
        fontSize: 18
    },
    picker: {
        height: 50,
        backgroundColor: 'white',
        width: '90%',
        marginBottom: 10,
    },
    indicator: {
        marginVertical: 20,
    },
    mostSpentContainer: {
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        alignItems: 'center',
        width: '90%',
    },
    mostSpentText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#333',
    },
    petName: {
        fontWeight: 'bold',
        color: '#000',
    },
    amount: {
        fontWeight: 'bold',
        color: '#FF4500',
    },
    petImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    totaluserpayment: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 9,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    chartContainer: {
        marginBottom: 20,
    },
    chartStyle: {
        marginVertical: 8,
        borderRadius: 16,
    },
});

export default PaymentScreen;
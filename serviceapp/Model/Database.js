import React from "react";
import { useState } from "react";
import { GlobalId, setId } from "./Globalid";

const API_URL = "http://0.0.0.0:3000/"; // Sunucunun URL'si (yerel geliştirme için)
//const API_URL = "Heroku vs."; // Sunucunun URL'si (canlı sunucu için)
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};


const registerUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log(data);
    setId(data.userId);

    if (!response.ok) {
      console.error(data.error, "kayit basarisiz");
    }

    return data;
  } catch (error) {
    console.error("Error registering user:", error.message);

  }
};


const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setId(data.userId);

    if (!response.ok) {
      console.error(data.error, "Giris basarisiz");
    }

    return data;
  } catch (error) {
    console.error("Giris yaparken hata olustu:", error.message);
    throw error;
  }
};

const uploadToImgBB = async (uri) => {
  const apiKey = 'Your ImgBB API Key';
  const formData = new FormData();
  formData.append('image', {
    uri,
    name: 'image.jpg',
    type: 'image/jpeg',
  });
  sleep(500);
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });
  sleep(500);
  const result = await response.json();
  if (result.success) {
    console.log('Image URL:', result.data.url);
    return result.data.url;
  } else {
    console.error('Error uploading image:', result.error);
  }
};

const addPetWithPhoto = async (uId, petphoto, petname, petage, petgender, petspecies, petrace) => {
  try {
    const response = await fetch(`${API_URL}addPet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uId, petphoto, petname, petage, petgender, petspecies, petrace }),
    });
    const data = await response.json();
    console.log(data, "addPet basarili");
  }
  catch (error) {
    console.error(error, "addPet hatasi");
  }
}

const fetchAllPet = async (uid) => {
  console.log("Gönderilen uid:", uid);
  try {
    const response = await fetch(`${API_URL}FetchAllPet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid }),
    });
    const data = await response.json();
    console.log(data.pets, "fetchAllPet basarili");
    return data.pets;
  }
  catch (error) {
    console.error(error, "fetchAllPet hatasi");
  }
}

const fetchAppointment = async (uid) => {
  try {
    const response = await fetch(`${API_URL}fetchAppointment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid }),
    });
    const data = await response.json();
    console.log(data.AppointmentPets, "fetchAllPet basarili");
    return data.AppointmentPets;
  }
  catch (error) {
    console.error(error, "fetchAppointment hatasi");
  }
}

const GetAppointment = async (uid, petId, petName, explain, appDate) => {
  try {
    const response = await fetch(`${API_URL}GetAppointment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid, petId, petName, explain, appDate }),
    });
    const data = await response.json();
    console.log(data, "GetAppointment basarili");
  }
  catch (e) {
    console.error("GetAppointment database hatasi:", e);
  }
}

const AddPayment = async (petId, amount) => {
  try {
    const uId = GlobalId;
    const date = new Date().toISOString("default");
    const response = await fetch(`${API_URL}AddPayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uId, petId, amount, date }),
    });
    const data = await response.json();
    console.log(data, "AddPayment basarili");
  }
  catch (e) {
    console.error("AddPayment database hatasi:", e);
  }
}

const fetchPayment = async () => {
  try {
    const uId = GlobalId;
    const response = await fetch(`${API_URL}getPayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uId: uId }),
    });
    const data = await response.json();
    console.log(data, "getPayment basarili");
    return data.payments;
  }
  catch (e) {
    console.error("getPayment database hatasi:", e);
  }
}

const fetchUserTotalSpend = async () => {
  try {
    const uId = GlobalId;
    const response = await fetch(`${API_URL}getUserTotalSpend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uId: uId }),
    });
    const data = await response.json();
    console.log(data, "getUserTotalSpend basarili");
    return data;
  }
  catch (e) {
    console.error("getUserTotalSpend database hatasi:", e);
  }
}

const logoutUser = async () => {
  try {
    const response = await fetch(`${API_URL}logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    setId("");

    if (!response.ok) {
      console.error(data.error, "Cikis basarisiz");
      return data.message;
    }
    console.log("cikis basarili");
    return data.message;

  } catch (error) {
    console.error("Cikis yaparken hata:", error.message);
  }
};

export default {
  loginUser,
  logoutUser,
  registerUser,
  uploadToImgBB,
  addPetWithPhoto,
  fetchAllPet,
  GetAppointment,
  fetchAppointment,
  AddPayment,
  fetchPayment,
  fetchUserTotalSpend
}
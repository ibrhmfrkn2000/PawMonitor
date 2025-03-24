const http = require('http');
const { MongoClient, ObjectId } = require('mongodb');

const uri = "Your MongoDB URI";
const client = new MongoClient(uri);

let usersCollection;
let petCollection;
let appointmentCollection;
let PaymentCollection;
client.connect().then(() => {
    usersCollection = client.db("PetAppDB").collection("users");
    petCollection = client.db("PetAppDB").collection("pets");
    appointmentCollection = client.db("PetAppDB").collection("AppointmentPets");
    PaymentCollection = client.db("PetAppDB").collection("Payment");
    console.log("Connected to MongoDB");
}).catch(error =>
    console.error("Error connecting to MongoDB:", error)
);

const sendResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}


const registerUser = async (req, res, body) => {
    const { email, password } = JSON.parse(body);

    
    try {
        const userExists = await usersCollection.findOne({ email });
        if (userExists) return sendResponse(res, 400, { error: "Kullanıcı zaten mevcut" });
        const TotalSpend = 0;
        
        const result = await usersCollection.insertOne({ email, password, TotalSpend });
        sendResponse(res, 201, { message: "Kullanıcı kayıt oldu", userId: result.insertedId });
    }
    catch (e) {
        console.error(e, "serviste register error verdi knk");
        sendResponse(res, 500, { error: "Sunucu hatası oluştu" });
    }

}


const loginUser = async (req, res, body) => {
    const { email, password } = JSON.parse(body);

    try {
        
        const user = await usersCollection.findOne({ email, password });
        if (!user) {
            return sendResponse(res, 401, { error: "Yanlış eposta veya şifre" });
        }

        sendResponse(res, 200, { message: "Giriş başarılı", userId: user._id });
    }
    catch (e) {
        console.error(e, "serviste login error verdi knk");
        sendResponse(res, 500, { error: "Sunucu hatası oluştu" });
    }
}

const AddPet = async (req, res, body) => {
    const { uId, petphoto, petname, petage, petgender, petspecies, petrace } = JSON.parse(body);
    try {
        const totalSpend = 0;
        const totalVisits = 0;
        const pet = await petCollection.insertOne({ uId, petphoto, petname, petage, petgender, petspecies, petrace, totalSpend, totalVisits });
        sendResponse(res, 201, { message: "evcil hayvan eklendi", userId: pet.insertedId });
    }
    catch (error) {
        console.error("serviste addpet hata verdi knk", error);
        sendResponse(res, 500, { error: "Sunucu hatası oluştu" });
    }
}

const FetchAllPet = async (req, res, body) => {
    try {
        const { uid: Id } = JSON.parse(body);
        console.log("Sunucuya gelen uId:", Id);
        const pet = await petCollection.find({ uId: Id }).toArray();
        console.log("Sorgu sonucu:", pet);
        if (!pet.length) {
            return sendResponse(res, 404, { message: "Hiç evcil hayvan bulunamadı" });
        }
        sendResponse(res, 201, { pets: pet });
    }
    catch (e) {
        console.error(e, "Hayvan çekerken hata oldu knk");
        sendResponse(res, 500, { error: "Sunucu hatası oluştu" });
    }
}

const fetchAppointment = async (req, res, body) => {
    try {
        const { id } = body;
        console.log("Sunucuya giden uid:", id);
        const appointment = await appointmentCollection.find({ id }).toArray();
        console.log("sorgu sonucu:", appointment);
        if (!appointment) {
            return sendResponse(res, 404, { message: "Hiç randevu bulunamadı" });
        }
        sendResponse(res, 201, { AppointmentPets: appointment });
    }
    catch (e) {
        console.error(e, "Randevu çekerken serviste hata oldu knk");
        sendResponse(res, 500, { error: "Sunucu hatası oluştu" });
    }
}

const GetAppointment = async (req, res, body) => {
    const { uid, petId, petName, explain, appDate } = JSON.parse(body);
    try {
        const result = await appointmentCollection.insertOne({ uid, petId, petName, explain, appDate });
        sendResponse(res, 201, { message: "Randevu kaydedildi", AppointmenId: result.insertedId });
    }
    catch (e) {
        console.error("servis kisminda hata", e);
        sendResponse(res, 500, { error: "Sunucu hatası oluştu" });
    }
}

const AddPayment = async (req, res, body) => {
    try {
        const { uId, petId, amount, date } = JSON.parse(body);

        const petIdObject = new ObjectId(petId);
        const userIdObject = new ObjectId(uId);
        const intAmount = parseInt(amount);

        const result = await PaymentCollection.insertOne({ uId: userIdObject, petId: petIdObject, amount: intAmount, Date: date });

        await usersCollection.updateOne(
            { _id: userIdObject },
            { $inc: { TotalSpend: intAmount } }
        );

        await petCollection.updateOne(
            { _id: petIdObject },
            { $inc: { totalSpend: intAmount, totalVisits: 1 } }
        );

        sendResponse(res, 201, { message: "Ödeme başarılı", PaymentId: result.insertedId });
    } catch (e) {
        console.error("AddPayment servisinde hata:", e);
        sendResponse(res, 500, { error: "Sunucu hatası oluştu." });
    }
}

const getPayment = async (req, res, body) => {
    try {
        const { uId } = JSON.parse(body);
        const userIdObject = new ObjectId(uId);
        console.log("Sunucuya gelen uId objesi:", userIdObject);
        const payments = await PaymentCollection.find({ uId: userIdObject }).toArray();
        console.log("Ödemeler:", payments);
        sendResponse(res, 200, { payments });
    } catch (e) {
        console.error("getPayment servisinde hata:", e);
        sendResponse(res, 500, { error: "Sunucu hatası oluştu." });
    }
}

const getUserTotalSpend = async (req, res, body) => {
    try {
        const { uId } = JSON.parse(body);
        console.log("Sunucuya gelen uId utotal:", uId);
        const userIdObject = new ObjectId(uId);
        const user = await usersCollection.findOne({ _id: userIdObject });
        console.log("Usr sorgu sonucu:", user);
        sendResponse(res, 200, { totalSpend: user.TotalSpend });
    } catch (e) {
        console.error("getUserTotalSpend servisinde hata:", e);
        sendResponse(res, 500, { error: "Sunucu hatası oluştu." });
    }
}


const logoutUser = async (res) => {
    try {
        sendResponse(res, 200, { message: "başarılı" });
        console.log("Logout service kisminda basarili");
    }
    catch (e) {
        sendResponse(res, 500, { message: "başarısız" });
        console.error("Logout service kisminda basarisiz");
    }

}


const server = http.createServer(async (req, res) => {
    let body = '';

    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
        if (req.method !== 'POST') {
            return sendResponse(res, 405, { error: "Only POST requests are allowed" });
        }

        switch (req.url) {
            case '/register':
                await registerUser(req, res, body);
                break;

            case '/login':
                await loginUser(req, res, body);
                break;

            case '/logout':
                await logoutUser(res);
                break;

            case '/addPet':
                await AddPet(req, res, body);
                break;

            case '/FetchAllPet':
                await FetchAllPet(req, res, body);
                break;

            case '/GetAppointment':
                await GetAppointment(req, res, body);
                break;

            case '/fetchAppointment':
                await fetchAppointment(req, res, body);
                break;

            case '/AddPayment':
                await AddPayment(req, res, body);
                break;

            case '/getPayment':
                await getPayment(req, res, body);
                break;

            case '/getUserTotalSpend':
                await getUserTotalSpend(req, res, body);
                break;

            default:
                sendResponse(res, 404, { error: "Not found" });
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

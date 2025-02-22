import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import fs from "fs";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express app setup
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Firebase initialization
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-database-d90a4.firebaseio.com",
});

const db = admin.firestore();
let emailid = "";
const getHospitalData = async (email) => {
  const snapshot = await db.collection("Hospitals")
    .where("email", "==", email)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const hospitalData = snapshot.docs[0].data();
  return {
    ...hospitalData,
    id: snapshot.docs[0].id
  };
};
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "t1.html"));
});
app.post("/final",(req,res)=>
{
  res.sendFile(path.join(_,"public","camp.html"));
});
app.post("/hospital", (req, res) => {
  console.log("Hospital Page Requested via POST");
  res.sendFile(path.join(__dirname, "public", "t2.html"));
});
app.post("/record",(req,res)=>
{
  res.sendFile(path.join(__dirname,"public","department.html"));
});
app.post("/camp", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "camp.html"));
});

app.post("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "initial.html"));
});

app.post("/startqueue", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "options2.html"));
});

app.post("/patient", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "patient1.html"));
});

app.post("/login", async (req, res) => {
  try {
    console.log("Received login request:", req.body);

    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const hospitalData = await getHospitalData(email);

    if (!hospitalData) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (!hospitalData.password) {
      return res.status(500).json({
        success: false,
        message: "Server error: Password field missing"
      });
    }

    if (hospitalData.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Set global email ID
    emailid = email;

    res.sendFile(path.join(__dirname, "public", "startqueue.html"));

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
});

app.post("/onlineapp", async (req, res) => {
  try {
    const hospitalData = await getHospitalData(emailid);

    if (!hospitalData) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    const mode = hospitalData.modeofdivision;

    if (mode === "Medical Speciality") {
      res.sendFile(path.join(__dirname, "public", "ms.html"));
    } else if (mode === "Doctor") {
      res.sendFile(path.join(__dirname, "public", "doc.html"));
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid mode of division"
      });
    }
  } catch (error) {
    console.error("Error in onlineapp:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
});

app.post("/update", async (req, res) => {
  try {
    console.log("Received token update request:", req.body);

    if (!req.body || !req.body.token) {
      return res.status(400).json({
        success: false,
        message: "Token number is required"
      });
    }

    const hospitalData = await getHospitalData(emailid);

    if (!hospitalData) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    // Create token data
    const tokenData = {
      tokenNumber: req.body.token,
      status: "waiting",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      hospitalId: hospitalData.id,
      hospitalName: hospitalData.name || "Unknown Hospital",
      estimatedWaitTime: 15, // in minutes
      department: hospitalData.modeofdivision || "General",
      patientInfo: {
        name: null,
        contactNumber: null
      }
    };

    // Store in hospital's tokens subcollection
    const tokenRef = await db.collection("Hospitals")
      .doc(hospitalData.id)
      .collection("tokens")
      .add(tokenData);

    // Store in global tokens collection
    await db.collection("tokens").doc(tokenRef.id).set({
      ...tokenData,
      tokenId: tokenRef.id
    });

    console.log("Token stored successfully with ID:", tokenRef.id);

    res.json({
      success: true,
      message: "Token created successfully",
      data: {
        tokenId: tokenRef.id,
        tokenNumber: req.body.token,
        estimatedWaitTime: tokenData.estimatedWaitTime
      }
    });

  } catch (error) {
    console.error("Error creating token:", error);
    res.status(500).json({
      success: false,
      message: "Error creating token",
      error: error.message
    });
  }
});

// Additional endpoints for token management
app.put("/tokens/:tokenId", async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { status, patientInfo } = req.body;

    const hospitalData = await getHospitalData(emailid);

    if (!hospitalData) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    // Update token in hospital's subcollection
    await db.collection("Hospitals")
      .doc(hospitalData.id)
      .collection("tokens")
      .doc(tokenId)
      .update({
        status,
        patientInfo,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // Update token in global collection
    await db.collection("tokens")
      .doc(tokenId)
      .update({
        status,
        patientInfo,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      success: true,
      message: "Token updated successfully"
    });

  } catch (error) {
    console.error("Error updating token:", error);
    res.status(500).json({
      success: false,
      message: "Error updating token",
      error: error.message
    });
  }
});

app.get("/tokens/current", async (req, res) => {
  try {
    const hospitalData = await getHospitalData(emailid);

    if (!hospitalData) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    const tokensSnapshot = await db.collection("Hospitals")
      .doc(hospitalData.id)
      .collection("tokens")
      .where("status", "==", "waiting")
      .orderBy("createdAt")
      .limit(10)
      .get();

    const tokens = tokensSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: tokens
    });

  } catch (error) {
    console.error("Error fetching tokens:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tokens",
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
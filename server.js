// Importera nödvändiga moduler
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// Skapa en Express-app
const app = express();
const db = new sqlite3.Database(process.env.DATABASE2);
// Ange port
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Autentisera användare
function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.status(401).json({ message: "Token saknas!" });
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Inte korrekt JWT!" });
        req.user = user;
        next();
    });
}

// Autentiseringsroutes
const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);


// Skydda en API-rutt
app.get("/api/protected", authenticateUser, (req, res) => {
    res.json({ message: "Skyddad route" });
});
// Funktion för att hämta alla menyalternativ
function getMenu(menuTable) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ${menuTable}`;
        db.all(sql, (err, rows) => {
            if (err) {
                reject("Något gick fel vid hämtning av menyalternativ.");
            } else {
                resolve(rows);
            }
        });
    });
}

// Route för att skicka bokningsinformation
app.post("/api/bookings", (req, res) => {
    const { name, numberOfGuests, phone, date, time } = req.body;
    if (!name || !numberOfGuests || !phone || !date || !time) {
        return res.status(400).json({ error: "Alla fält måste fyllas i." });
    }

    const sql = `INSERT INTO bookings (name, number_of_guests, phone, date, time) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, numberOfGuests, phone, date, time], (err) => {
        if (err) {
            return res.status(500).json({ error: "Något gick fel vid bokningen." });
        } else {
            return res.status(200).json({ message: "Bokning genomförd." });
        }
    });
});

// Route för att hämta alla bokade bord
app.get("/api/bookings", authenticateUser, (req, res) => {
    const sql = `SELECT * FROM bookings`;
    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Något gick fel vid hämtning av bokningar." });
        } else {
            return res.status(200).json(rows);
        }
    });
});

// Route för att lägga till nytt menyalternativ
app.post("/api/menu/:category", authenticateUser, (req, res) => {
    const category = req.params.category;
    const { name, price, ingredients } = req.body;
    if (!name || !price || !ingredients) {
        return res.status(400).json({ error: "Alla fält måste fyllas i." });
    }

    // Skapa SQL-frågan baserat på kategorinamn
    const sql = `INSERT INTO menu_${category} (name, price, ingredients) VALUES (?, ?, ?)`;
    db.run(sql, [name, price, ingredients], (err) => {
        if (err) {
            return res.status(500).json({ error: "Något gick fel vid tillägg av menyalternativ." });
        } else {
            return res.status(200).json({ message: "Menyalternativ tillagt." });
        }
    });
});


// Route för att hämta alla menyalternativ för en viss kategori
app.get("/api/menu/:category", (req, res) => {
    const category = req.params.category;
    getMenu(`menu_${category}`)
        .then(menuItems => {
            res.status(200).json(menuItems);
        })
        .catch(error => {
            res.status(500).json({ error: error });
        });
});


// Route för att ta bort ett menyalternativ
app.delete("/api/menu/:category/:id", authenticateUser, (req, res) => {
    const category = req.params.category;
    const menuItemId = req.params.id;
    
    // SQL-fråga för att ta bort menyalternativet från databasen baserat på menuItemId och kategori
    const sql = `DELETE FROM menu_${category} WHERE id = ?`;
    db.run(sql, [menuItemId], (err) => {
        if (err) {
            return res.status(500).json({ error: "Något gick fel vid borttagning av menyalternativ." });
        } else {
            return res.status(200).json({ message: "Menyalternativ borttaget." });
        }
    });
});

// Starta servern
app.listen(port, () => {
    console.log(`Servern är igång på http://localhost:${port}`);
});
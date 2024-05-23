require("dotenv").config(); // Ladda miljövariabler från .env-filen
const express= require ("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose(); // importera SQLite-databasen
const bcrypt = require("bcrypt"); // importera bcrypt för hashning
const jwt = require("jsonwebtoken"); // Importera JWT för autentisering

// Ansluta till databasen
const db = new sqlite3.Database(process.env.DATABASE2); 

// Route för att skapa en ny admin
router.post("/register", async(req, res) => {
    try {
        const {username, password, email } = req.body;
        if (!username || !password || !email){
            return res.status(400).json({error: "Ogiltig indata, skicka användarnamn, lösenord och e-post"});
        }

        // hasha lösenordet 
        const hashPassword = await bcrypt.hash(req.body.password, 10);

        const sql = `INSERT INTO users(username, password, email) VALUES(? , ?, ?)`;
        db.run(sql, [username, hashPassword, email], (err) => {
            if(err){
                return res.status(400).json({message: "Fel vid skapande av användare..."});
            } else {
                return res.status(201).json({message: "Användare skapad"});
            }
        });
    } catch(error){
        return res.status(500).json({error: "Serverfel"});
    }
});
// Route för inloggning
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        // Validera indata
        if (!username || !password) {
            return res.status(400).json({ error: "Ogiltig indata, skicka användarnamn och lösenord" });
        }

        // Kontrollera om admin existerar i databasen
        const sql = `SELECT * FROM users WHERE username=?`;
        db.get(sql, [username], async (err, row) => {
            if (err) {
                return res.status(400).json({ message: "Fel vid autentisering!" });
            } else if (!row) {
                return res.status(401).json({ message: "Felaktigt användarnamn/lösenord" });
            } else {
                // Användaren existerar - kontrollera användarnamn och lösenord
                const passwordMatch = await bcrypt.compare(password, row.password);
                if (!passwordMatch) {
                    return res.status(401).json({ message: "Felaktigt användarnamn/lösenord" });
                } else {
                    // Skapa JWT-token med användarnamnet i payloaden
                    const payload = { username: username };
                    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
                    const response = {
                        message: "Användare inloggad!",
                        token: token,
                        username: username // Skicka användarnamnet i svarsobjektet
                    }
                    // Inloggning lyckades
                    return res.status(200).json(response);
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ error: "Serverfel" });
    }
});

// Route för att hämta alla användarnamn
router.get("/usernames", authenticateToken, (req, res) => {
    const sql = `SELECT * FROM users`;
    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Serverfel" });
        } else {
            const usernames = rows.map(row => row.username);
            return res.status(200).json( usernames);

        }
    });
});
router.get("/bord", authenticateToken, (req, res) => {
    const sql = `SELECT * FROM bookings`;
    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Serverfel" });
        } else {
            const all = [];
            const usernames = rows.map(row => row.username);
            const numberGuest = rows.map(row => row.number_of_guests);
            const phone = rows.map(row => row.phone);
            const date = rows.map(row => row.date);
            const time = rows.map(row => row.time);
            return res.status(200).json( usernames);

        }
    });
});
// Route för att lägga till ett nytt menyalternativ
router.post("/menu", authenticateToken, (req, res) => {
    const { name, price, ingredients } = req.body;
    if (!name || !price || !ingredients) {
        return res.status(400).json({ error: "Alla fält måste fyllas i." });
    }

    const sql = `INSERT INTO menu (name, price, ingredients) VALUES (?, ?, ?)`;
    db.run(sql, [name, price, ingredients], (err) => {
        if (err) {
            return res.status(500).json({ error: "Något gick fel vid tillägg av menyalternativ." });
        } else {
            return res.status(201).json({ message: "Menyalternativ tillagt." });
        }
    });
});

// Route för att hämta alla menyalternativ
router.get("/menu", (req, res) => {
    const sql = `SELECT * FROM menu`;
    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Något gick fel vid hämtning av menyalternativ." });
        } else {
            return res.status(200).json(rows);
        }
    });
});

// Middleware-funktion för att autentisera JWT-token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.status(401).json({ message: "Token saknas!" });
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Inte korrekt JWT!" });
        req.username = user.username;
        next();
    });
}

module.exports= router; // Exportera router för att användas i andra filer
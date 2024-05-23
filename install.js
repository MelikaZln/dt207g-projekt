require("dotenv").config(); // Ladda miljövariabler från .env-filen
const express = require("express");
const sqlite3 = require("sqlite3").verbose(); // Importera SQLite-databasen

// anslutning till databasen med den angivna sökvägen från miljövariabler
const db = new sqlite3.Database(process.env.DATABASE2);


db.serialize(() => {
    // Radera tabellen om den redan existerar
    db.run("DROP TABLE IF EXISTS users");

    // Skapa en ny admintabell med kolumner för användarnamn, lösenord, e-post och skapad datum/tid
    db.run(`CREATE TABLE users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.serialize(() => {
        // Skapa en ny tabell för bokningar
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            number_of_guests INTEGER NOT NULL,
            phone TEXT NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL
        )`);

    console.log("BOOKING TABLE CREATED"); 
    })
            // Skapa nya menytabeller
    db.run(`CREATE TABLE IF NOT EXISTS menu_alkoholfritt (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        ingredients TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS menu_efterratt (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        ingredients TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS menu_forratt  (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        ingredients TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS menu_huvudratt (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        ingredients TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS menu_vin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        ingredients TEXT NOT NULL
    )`);
    console.log("MENU TABLE CREATED");
});

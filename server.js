require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from Public folder
const publicPath = path.join(__dirname, "Public");
app.use(express.static(publicPath));

// Root route - serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

// API to unlock and get letter
app.post("/api/unlock", (req, res) => {
    const { password } = req.body;

    if (password === process.env.VALENTINE_PASSWORD) {
        return res.json({ success: true });
    }

    res.json({ success: false });
});

// API to get letter (only after unlock)
app.get("/api/letter", (req, res) => {
    try {
        const letterData = fs.readFileSync(
            path.join(__dirname, "letters.json"),
            "utf8"
        );
        const { letter } = JSON.parse(letterData);
        res.json({ letter });
    } catch (error) {
        res.status(500).json({ error: "Could not load letter" });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port " + (process.env.PORT || 3000));
});

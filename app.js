// Required packages
const express = require("express");
const fetch = require("node-fetch");

require("dotenv").config();

// Create the Express server
const app = express();

// Server port number
const PORT = process.env.PORT || 3000;

// Set template engine
app.set("view engine", "ejs");
app.use(express.static("pubic"));

// Parse HTML data for POST requests
app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

// Function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    const regex = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/convert-mp3", async (req, res) => {
    const videoUrl = req.body.videoID;

    if (!videoUrl) {
        return res.render("index", {
            success: false,
            message: "Please Enter A Video URL",
        });
    } else {
        const videoId = getYouTubeVideoId(videoUrl);

        if (!videoId) {
            return res.render("index", {
                success: false,
                message: "Invalid YouTube Video URL",
            });
        }

        const fetchAPI = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": process.env.API_KEY,
                "x-rapidapi-host": process.env.API_HOST
            }
        });

        try {
            const fetchResponse = await fetchAPI.json();

            if (fetchResponse.status === "ok") {
                return res.render("index", { success: true, song_title: fetchResponse.title, song_link: fetchResponse.link });
            } else {
                return res.render("index", { success: false, message: fetchResponse.msg });
            }
        } catch (error) {
            console.error(error);
            return res.render("index", { success: false, message: "Error processing the API response" });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

const mongoose = require("mongoose");
const express = require("express");
const Document = require("./Models/Document.model.js");

const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const defaultValue = "";

const io = require("socket.io")(3001, {
    cors: {
        origin: "*",
        method: ["GET", "POST"],
    },
});

const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://sabbirmadman:MADMANSBX2@cluster0.bxwjh.mongodb.net/documentData?retryWrites=true&w=majority"
        );
        console.log("MongoDB connection SUCCESS");
    } catch (error) {
        console.log(error);
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB connection DISCONNECTED");
});

mongoose.connection.on("connected", () => {
    console.log("MongoDB CONNECTED");
});

io.on("connection", (socket) => {
    socket.on("get-document", async (documentId) => {
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId);
        socket.emit("load-document", document.data);

        socket.on("send-changes", (delta) => {
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        });

        socket.on("save-document", async (data) => {
            await Document.findByIdAndUpdate(documentId, { data });
        });
    });
});

async function findOrCreateDocument(id) {
    if (id == null) return;

    const document = await Document.findById(id);
    if (document) return document;
    return await Document.create({ _id: id, data: defaultValue });
}

app.listen(8000, () => {
    connectDB();
    console.log("Server is running on port 8000");
});

//get all the documents from the database
app.get("/documents", async (req, res) => {
    const documents = await Document.find();
    res.json(documents);
});

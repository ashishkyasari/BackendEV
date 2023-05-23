const express = require('express');
require('./connection/dbconnection');
const reg = require('./Schema/register');
const Station = require('./Schema/station');
const Contact = require('./Schema/contact');
const cors = require('cors');


const app = express();
app.use(express.json())
app.use(express.urlencoded())
app.use(cors());


const port = 5001


// Function to update the boolean array values to false
async function updateSlots() {
    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    //console.log(currentHours + " " + currentMinutes);

    const startTime = new Date().setHours(0, 0, 0, 0); // Set the start time to the beginning of the day (00:00)

    // Calculate the index of the current time based on 30-minute intervals
    if (currentMinutes % 30 === 0) {
        console.log("in");
        const index = ((currentHours * 60) + currentMinutes) / 30;
        // const index = 0;

        try {
            // Find the station in the database
            const station = await Station.findOne();

            // Set the value to false for all slots starting from the calculated index
            // for (let i = index; i < station.Machine1.length; i++) {
            //     station.Machine1[i].value = false;
            //     station.Machine2[i].value = false;
            // }

            station.Machine1[index].value = false;
            station.Machine2[index].value = false;

            // Save the updated station to the database
            await station.save();
        } catch (error) {
            console.error(error);
            // Handle the error
        }
    }
}

// Schedule the updateSlots function to run every 30 minutes
setInterval(updateSlots, 30 * 600);

app.post("/register", async (req, res) => {
    try {
        console.log(req.body);
        const { name, phoneno, email, password } = req.body
        const user = new reg({
            name,
            phoneno,
            email,
            password,
        })
        const registered = await user.save();
        console.log(registered);
        res.send("Registered Succefully");
    } catch (e) {
        console.log(e);
        res.send({ message: e });
    }
})


app.post("/contacts", async (req, res) => {
    try {
        const { subject, message } = req.body;

        const newContact = new Contact({
            subject,
            message
        });

        const savedContact = await newContact.save();

        res.status(201).json(savedContact);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ message: 'Failed to save contact' });
    }
});


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);

        const user = await reg.findOne({ email: email });
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        if (user.password !== password) {
            res.status(401).send({ message: "Invalid password" });
            return;
        }

        // Authentication successful
        res.send({ message: "Login successful",user});
    } catch (e) {
        console.log(e);
        res.status(500).send({ message: "Internal Server Error" });
    }
})


app.post("/station", async (req, res) => {
    try {
        const { name, price, location } = req.body; // Retrieve values from the request body

        const newStation = new Station({
            name: name || 'Station 1', // Use request body value or default value
            price: price || 30,
            location: location || 'Vishrambagh sangli',
        });

        // Save the newStation to the database using async/await
        try {
            const savedStation = await newStation.save();
            console.log('Station saved successfully:', savedStation);
            res.status(200).json(savedStation);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to save station' });
        }
    } catch (e) {
        console.log(e);
        res.status(400).json({ error: 'Invalid request' });
    }
});


app.get("/stationdata", async (req, res) => {
    try {
        const stations = await Station.find(); // Retrieve all documents from the station collection

        res.status(200).json(stations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

// app.get("/stations/availability", async (req, res) => {
//     try {
//         const startTime = new Date(req.query.start); // Retrieve the start time from the query parameters
//         const numSlots = parseInt(req.query.slots); // Retrieve the number of slots from the query parameters

//         const stations = await Station.find({
//             $or: [
//                 {
//                     $and: [
//                         { 'Machine1.timestamp': { $gte: startTime } }, // Check if the start time is greater than or equal to the slot's timestamp
//                         { 'Machine1.value': false }, // Check if the slot is available in Machine1
//                         { 'Machine1.value': { $slice: numSlots } } // Check if there are 'numSlots' continuous available slots in Machine1
//                     ]
//                 },
//                 {
//                     $and: [
//                         { 'Machine2.timestamp': { $gte: startTime } }, // Check if the start time is greater than or equal to the slot's timestamp
//                         { 'Machine2.value': false }, // Check if the slot is available in Machine2
//                         { 'Machine2.value': { $slice: numSlots } } // Check if there are 'numSlots' continuous available slots in Machine2
//                     ]
//                 }
//             ]
//         });

//         res.status(200).json(stations);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to fetch stations' });
//     }
// });



app.get("/availability", async (req, res) => {
    try {
        const startTime = req.query.startTime; // Retrieve the index from the query parameters
        const numSlots = req.query.Slots // Retrieve the number of slots from the query parameters
        console.log(req.body);
        const [hr, min] = startTime.split(":").map(Number);
        const index = ((hr * 60) + min) / 30;
        console.log(hr + " " + min + " " + index + " " + numSlots);

        const stations = await Station.find(); // Retrieve all stations from the database

        const filteredStations = stations.filter((station) => {
            const machine1Array = station.Machine1.slice(index, index + numSlots); // Get the subarray from Machine1
            const machine2Array = station.Machine2.slice(index, index + numSlots); // Get the subarray from Machine2
            // Check if all elements in the subarrays are false
            const isMachine1ContinuousFalse = machine1Array.some(slot => slot.value === true);
            const isMachine2ContinuousFalse = machine2Array.some(slot => slot.value === true);

            console.log(isMachine1ContinuousFalse + " " + isMachine2ContinuousFalse);

            if (!isMachine1ContinuousFalse || !isMachine2ContinuousFalse) {
                return true;
            } else {
                false;
            }

            //return isMachine1ContinuousFalse || isMachine2ContinuousFalse; // Return true if either Machine1 or Machine2 has a continuous sequence of false values
        });

        res.status(200).json(filteredStations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});


app.post("/book", async (req, res) => {
    try {
        const startTime = req.body.startTime; // Retrieve the index from the query parameters
        const numSlots = req.body.Slots; // Retrieve the number of slots from the query parameters
        const stationName = req.body.name;
        console.log(req.body);
        const [hr, min] = startTime.split(":").map(Number);
        const index = ((hr * 60) + min) / 30;
        console.log(hr + " " + min + " " + index + " " + numSlots);

        const station = await Station.findOne({ name: stationName });

        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }

        // Find the slots to book based on the start time and number of slots
        const slotsToBook1 = station.Machine1.slice(index, index + numSlots);

        // Check if any of the slots are already booked
        const alreadyBooked1 = slotsToBook1.some(slot => slot.value === true);

        if (alreadyBooked1) {
            const slotsToBook2 = station.Machine2.slice(index, index + numSlots);
            const alreadyBooked2 = slotsToBook2.some(slot => slot.value === true);
            if (alreadyBooked2) {
                return res.status(400).json({ error: 'One or more slots are already booked' });
            }
            slotsToBook2.forEach(slot => {
                slot.value = true;
            });

            // Save the updated station to the database
            await station.save();

            res.status(200).json({ message: 'Slots booked successfully' });
        }

        // Book the slots by setting the value to true
        slotsToBook1.forEach(slot => {
            slot.value = true;
        });

        // Save the updated station to the database
        await station.save();

        res.status(200).json({ message: 'Slots booked successfully' });

    } catch (e) {
        console.log(e);
    }
})



app.listen(port, (req, res) => {
    console.log(`Server Runnning on port ${port}`);
})
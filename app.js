const express = require("express");
const mongoose = require("mongoose");
const app = express();
const axios = require("axios");
const port = process.env.PORT || 3000;
const Store = require("./api/models/store");
const GoogleMapsService = require("./api/services/googleMapsService");
const googleMapsService = new GoogleMapsService();
require("dotenv").config();

mongoose.connect(
  `mongodb+srv://${process.env.MOONGOOSE_USER}:${process.env.MOONGOOSE_PASS}@cluster0.leoqx.mongodb.net/test?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }
);

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.post("/api/stores", (req, res) => {
  let dbStores = [];
  let stores = req.body;
  stores.map((e) => {
    dbStores.push({
      storeName: e.name,
      phoneNumber: e.phoneNumber,
      address: e.address,
      openStatusText: e.openStatusText,
      addressLines: e.addressLines,
      location: {
        type: "Point",
        coordinates: [e.coordinates.longitude, e.coordinates.latitude],
      },
    });
  });
  Store.create(dbStores, (err, stores) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(stores);
    }
  });
});

app.get("/api/stores", (req, res) => {
  const zipCode = req.query.zip_code;
  googleMapsService
    .getCoordinates(zipCode)
    .then((coordinates) => {
      Store.find(
        {
          location: {
            $near: {
              $maxDistance: 3218,
              $geometry: {
                type: "Point",
                coordinates: coordinates,
              },
            },
          },
        },
        (err, stores) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send(stores);
          }
        }
      );
    })
    .catch((error) => {
      console.log(error);
    });
});

app.delete("/api/stores", (req, res) => {
  Store.deleteMany({}, (err) => {
    res.status(200).send(err);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

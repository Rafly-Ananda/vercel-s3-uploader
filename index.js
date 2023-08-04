const express = require("express");
const app = express();
app.use(express.json({ limit: "50mb" }));
require("dotenv").config();

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/api", async (req, res) => {
  try {
    if (!req.body.bookingId) {
      throw "Need bookingId parameter";
    }

    if (!req.body.buffer) {
      throw "Need Buffer parameter";
    }

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${req.body.bookingId}.pdf`,
      Body: Buffer.from(req.body.buffer),
      ContentType: "application/pdf",
    };
    await s3Client.send(new PutObjectCommand(s3Params));

    res.send({ message: "PDF Saved to S3" }).status(200);
  } catch (err) {
    console.log(err);
    res.send({ message: "Request Failed", error: err });
    return null;
  }
});

app.listen(process.env.PORT || 5001, () => {
  console.log("Server started");
});

module.exports = app;

// const app = require("express")();
// require("dotenv").config();

// const puppeteer = require("puppeteer-core");
// const chromium = require("@sparticuz/chromium");
// const axios = require("axios");

// let browser;
// let page;

// async function init() {
//   try {
//     browser = await puppeteer.launch({
//       executablePath: await chromium.executablePath(),
//       headless: chromium.headless,
//       ignoreHTTPSErrors: true,
//       defaultViewport: chromium.defaultViewport,
//       args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
//     });
//   } catch (e) {
//     throw e;
//   }
// }

// async function generatePdf(url, bookingId) {
//   console.log("Generating PDF");
//   try {
//     page = await browser.newPage();
//     await page.goto(url, {
//       waitUntil: "networkidle0",
//     });

//     const buffer = await page.pdf({ format: "a4" });

//     console.log("Generating PDF Success");
//     await axios.post(`${process.env.S3_UPLOADER_SERVER}/api`, {
//       bookingId,
//       buffer,
//     });

//     return `https://gadjah-ticketing-platform.s3.ap-southeast-1.amazonaws.com/${bookingId}.pdf`;
//   } catch (e) {
//     throw e;
//   }
// }

// app.get("/api", async (req, res) => {
//   try {
//     if (!req.query.bookingId) {
//       throw "Need bookingId parameter";
//     }

//     if (!req.query.url) {
//       throw "Need query parameter";
//     }

//     const result = await generatePdf(req.query.url, req.query.bookingId);

//     console.log("PDF Saved");
//     res.send({ message: "PDF Generated", s3Url: result }).status(200);
//   } catch (err) {
//     console.log(err);
//     res.send({ message: "Request Failed", error: err });
//     return null;
//   }
// });

// app.listen(process.env.PORT || 5002, () => {
//   init();
//   console.log("Server started");
// });

// module.exports = app;

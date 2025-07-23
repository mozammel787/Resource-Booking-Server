import express, { Request, Response } from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MongoURI!, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

interface Booking {
  _id?: ObjectId;
  date: string;
  resource: string;
  timeFrom: string;
  timeTo: string;
  requestedBy?: string;
  bufferFrom?: string;
  bufferTo?: string;
}

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    const database = client.db("resource_db");
    const resourceCollection = database.collection<Booking>("resource");

    console.log("Connected to MongoDB!");

    app.post("/bookings", async (req: Request, res: Response) => {
      const { timeFrom, timeTo, date, resource: resourceName } = req.body;

      if (!timeFrom || !timeTo || !date || !resourceName) {
        return res.status(400).send("Missing fields");
      }

      const adjust = (time: string, min: number): string => {
        const [h, m] = time.split(":").map(Number);
        const d = new Date();
        d.setHours(h, m + min, 0, 0);
        return d.toTimeString().slice(0, 5);
      };

      const bufferFrom = adjust(timeFrom, -10);
      const bufferTo = adjust(timeTo, 10);

      const conflict = await resourceCollection.findOne({
        date,
        resource: resourceName,
        $expr: {
          $and: [
            { $lt: ["$bufferFrom", bufferTo] },
            { $gt: ["$bufferTo", bufferFrom] },
          ],
        },
      });

      if (conflict) {
        return res.status(400).json({
          message: `${conflict.bufferFrom} –${conflict.bufferTo} is already booked. Please try a time at least 10 minutes before or after this range.`,
        });
      }

      const result = await resourceCollection.insertOne({
        ...req.body,
        bufferFrom,
        bufferTo,
      });

      res.send(result);
    });


    app.get("/bookings", async (req: Request, res: Response) => {
      try {
        const { resource, date } = req.query;
        const filter: any = {};
        if (resource) {
          filter.resource = { $regex: `${resource}$`, $options: "i" };
        }
        if (date) {
          filter.date = date;
        }
        const result = await resourceCollection.find(filter).toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching bookings");
      }
    });



    app.delete("/booking-delete/:id", async (req: Request, res: Response) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await resourceCollection.deleteOne(query);
      res.send(result);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is running");
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

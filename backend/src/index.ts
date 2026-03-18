import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import envRoute from "./routes/environment";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5001;

app.use(cors());
app.use(express.json());

app.use("/api/environment", envRoute);
app.use('/api', healthRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

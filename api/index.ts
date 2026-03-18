import express from 'express';
import { vmRoutes } from '../src/presentation/routes/VmRoutes';

const app = express();

app.use(express.json());

// Homepage Route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'running', message: 'API is running' });
});

// API Routes
app.use('/api', vmRoutes);

// Export for Vercel Serverless Function
export default app;

// Allow local testing if running directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

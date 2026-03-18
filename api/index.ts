import express from 'express';
import { vmRoutes } from '../src/presentation/routes/VmRoutes';

const app = express();

app.use(express.json());

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

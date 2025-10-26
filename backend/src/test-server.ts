import express from 'express';
import { Router } from 'express';

const app = express();
const router = Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

app.use('/api', router);

app.listen(3001, () => {
  console.log('Test server running on port 3001');
});

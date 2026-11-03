import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 EcoFood Backend corriendo en http://localhost:${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/health`);
});

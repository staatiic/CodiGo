import express from 'express';
import userRoutes from './routes/userroutes.js';
import modulesRoutes from './routes/modules.routes.js';
import levelRoutes from './routes/level.routes.js';
import questionsRoutes from './routes/questions.routes.js';
import answersRoutes from './routes/answers.routes.js';
import { config } from './config.js';  

const app = express();

app.use(express.json());
app.use(userRoutes);
app.use(modulesRoutes);
app.use(levelRoutes);
app.use(questionsRoutes);
app.use(answersRoutes);

const PORT = config.PORT;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`App listening on port ${PORT} :p`);
});

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user_api');
const taskRoutes = require('./routes/task_api');
const notificationRoutes = require('./routes/notification_api');

const app = express();
const PORT = process.env.PORT || 3000;

const appUrl = 'https://harshar715.herokuapp.com';
app.set("appUrl", appUrl);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public', { maxAge: 31557600 }));

const httpServer = app.listen(PORT, function () { console.log('listening to PORT'); });

mongoose.connect(`mongodb+srv://harshar715:harsha12345@mydatabase-imncy.mongodb.net/To-Do-App?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.Promise = global.Promise;

app.use('/api', userRoutes);
app.use('/api', taskRoutes);
app.use('/api', notificationRoutes);

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
 
import mainRouter from "./server/routes/main.js";
import adminRouter from "./server/routes/admin.js";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import session from "express-session";
import methodOverride from "method-override";
import connectDB from "./server/config/db.js";

import isActiveRoute from "./server/helper/routeHelpers.js";

const app = express();
const port = 3000 || process.env.port;
//DB connection
connectDB();

//Static Public folder
app.use(express.static('public'));

//Middlewares to allow to pass data
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

// `currentRoute` available in all EJS files
app.use((req, res, next) => {
    res.locals.currentRoute = req.path;  
    next();
});

app.use(session({
    secret: 'natsu dragoneel',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}));

//Templating engine
app.use(expressEjsLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/main');

app.locals.isActiveRoute = isActiveRoute; 

//Accessing Routes
app.use('/', mainRouter);
app.use('/', adminRouter);

app.listen(port, () =>{
    console.log(`Server Live at port:${port}`);
});


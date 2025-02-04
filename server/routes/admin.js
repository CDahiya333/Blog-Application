import dotenv from "dotenv";
dotenv.config(); // Ensures access to .env variables

import express from "express";
import Post from "../models/post.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const adminRouter = express.Router();
const adminLayout = "layouts/admin";

const jwtSecret = process.env.JWT_SECRET;
if(!jwtSecret){
    console.log("Missing JWT_SECRET_KEY.");
}

//MiddleWare to Check if we have the cookie
const authMiddleware = (req, res,next) =>{
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message: "UnAuthorized"});
    }

    try {
        const decoded = jwt.verify(token, jwtSecret );
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({message: "UnAuthorized"});
    }
}

//GET Admin Page
adminRouter.get('/admin', async(req,res) =>{
    try {
        const locals = {
            title: "Admin",
            description: "AdminDashBoard"
        }

        res.render("admin/index", {locals, layout: adminLayout});
    } catch (error) {
     console.error("Error Message:", error.message);   
    }
});

//Check for Login Credentials
adminRouter.post('/admin', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne( { username } );
  
      if(!user) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if(!isPasswordValid) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const token = jwt.sign({ userId: user._id}, jwtSecret );
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/dashboard');
  
    } catch (error) {
      console.log(error);
    }
});

  //Geting Admin Dashboard

adminRouter.get('/dashboard', authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: 'Dashboard',
        description: 'Simple Blog created with NodeJs, Express & MongoDb.'
      }
  
      const data = await Post.find();
      res.render('admin/dashboard', {
        locals,
        data,
        layout: adminLayout
      });
  
    } catch (error) {
      console.log(error);
    }
  
});
 
// /**
//  * Admin - Create New Post
// GET
// */
adminRouter.get('/add-post', authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: 'Add Post',
        description: 'Simple Blog created with NodeJs, Express & MongoDb.'
      }
  
      const data = await Post.find();
      res.render('admin/add-post', {
        locals,
        layout: adminLayout
      });
  
    } catch (error) {
      console.log(error);
    }
  });

//   /**
//  * POST /
// */
adminRouter.post('/add-post', authMiddleware, async (req, res) => {
    try {
      try {
        const newPost = new Post({
          title: req.body.title,
          body: req.body.body
        });
  
        await Post.create(newPost);
        res.redirect('/dashboard');
      } catch (error) {
        console.log(error);
      }
  
    } catch (error) {
      console.log(error);
    }
  });


//   /**
//  * GET /
//  * Admin - EDIT POST
// */
adminRouter.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      const locals = {
        title: "Edit Post",
        description: "Free NodeJs User Management System",
      };
  
      const data = await Post.findOne({ _id: req.params.id });
  
      res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });

//   /**
//  * PUT /
// */
adminRouter.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
      });
  
      res.redirect(`/post/${req.params.id}`);
  
    } catch (error) {
      console.log(error);
    }
  
  });

  
// /**
//  * DELETE /
//  * Admin - Delete Post
// */
adminRouter.delete('/delete-post/:id', authMiddleware, async (req, res) => {

    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });
  
  

//Register BLocks
//GET
  adminRouter.get('/register', (req, res) => {
    try {
        res.render('admin/register', { layout: adminLayout });
    } catch (error) {
        console.error("Error rendering register page:", error.message);
    }
});

//POST
adminRouter.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
        //We will store encrypted password in the DB
      try {
        const user = await User.create({ username, password:hashedPassword });
        res.status(201).json({ message: 'User Created', user });
      } catch (error) {
        if(error.code === 11000) {
          res.status(409).json({ message: 'User already in use'});
        }
        res.status(500).json({ message: 'Internal server error'})
      }
  
    } catch (error) {
      console.log(error);
    }
  });
  

  /**
 * GET /
 * Admin Logout
*/
adminRouter.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
  });
  
export default adminRouter;
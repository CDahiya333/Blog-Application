import express from "express";
const mainRouter = express.Router();
//Import mongoose model
import Post from "../models/post.js";

//HOME
// METHOD_ GET

mainRouter.get('', async(req,res) =>{
    const locals = {
        title: "NodeJS Blog",
        description: "Simple Blog created using MongoDB, NodeJs & Express"
    };
    
    try {
        //Implementing Pagination
        let perPage = 6;
        let page = req.query.page || 1;
        let skipcount = (page-1)* perPage;
         
        // // Log to check page and skip count
        // console.log('Page:', page, 'Skip Count:', skipcount);

        const data = await Post.aggregate([
            {$sort: { createdAt: -1}},
            {$skip: skipcount},
            {$limit: perPage}
        ]); // OldestatTop

    //      // Log to check data fetched
    // console.log('Fetched Posts:', data.length, 'Per Page:', perPage);

        //Checking if thereis Next page
        const count = await Post.countDocuments();
        const nextPage = parseInt(page) +1;
        const hasNextPage = nextPage <= Math.ceil(count /perPage);
        const hasPrevPage = (parseInt(page) >1);
        const prevPage = ( parseInt(page) -1);

        //When hasNextPage true hasPrevPage is false

    //     // Log nextPage and hasNextPage status
    // console.log('Next Page:', nextPage, 'Has Next Page:', hasNextPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage? nextPage:null,
            prevPage: hasPrevPage? prevPage:null,
            currentRoute: '/'
        });
    } catch (error) {
        console.error("Post Not Found",error.message);
    }
});

//Rendering Posts Data
//METHOD_GET
mainRouter.get('/post/:id', async(req,res) =>{
    
    try {
        const locals = {
            title: "NodeJS Blog",
            description: "Simple Blog created using MongoDB, NodeJs & Express"
        };
        
        let slug = req.params.id;
        //Finding the post by it's id
        const data = await Post.findById(slug);
         
        if(!data){
            res.status(404).render('error',{locals, message:"Post Doesn't Exist"});
        }
        //Rendering the data
        res.render('post', {
            locals,
            data,
            // currentRoute:`/post/${slug}`
            });
    } catch (error) {
        console.error("Post Not Found",error.message);
    }
});

//Get Search Term
mainRouter.post('/search', async(req,res) =>{
   
    try {
        const locals={
            title: "Search",
            description: " ExampleDescription"
        }

        let searchterm = req.body.searchTerm;
        const searchNoSpecialCharacters = searchterm.replace(/[^a-zA-Z0-9 ]/g,"")

        const data = await Post.find({
            $or:[
                {   title: { $regex: searchNoSpecialCharacters, $options: "i"}},
                {   body: { $regex:  searchNoSpecialCharacters, $options: "i" }}
            ]
        });
        res.render("search",{
            locals,
            data
        });
    } catch (error) {
         console.error("Not Found:",error.message);
    }
})

//Get ABout Route
mainRouter.get('/about', (req,res) =>{
    res.render('about',{
        currentRoute:`/about`
    });
});

//CONTACT

//METHOD_GET
mainRouter.get('/contact', (req,res) =>{
    res.render('contact',{
        currentRoute: "/contact"
    });
});

export default mainRouter;
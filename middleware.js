const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");

const client = require("./redis.js");



module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","Log in to add a listing");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
    // console.log(req);
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
        // console.log(res.locals.redirectUrl);
    }
    next();
};

module.exports.isOwner=async(req,res,next)=>{
    const { id } = req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You do not have permission to edit/delete !");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// module.exports.validateListing=async(req,res,next)=>{
//     let {error}=listingSchema.validate(req.body);
//     if(error){
//         let errMsg=error.details.map((el)=>el.message).join(",");
//        throw new ExpressError(400,errMsg);
//     }else{
//         next();
//     }
// };


module.exports.validateListing = async (req, res, next) => {
    let { error } = listingSchema.validate(req.body, { allowUnknown: true });

    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    next();
};



module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
       throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor=async(req,res,next)=>{
    const { id,reviewId } = req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You do not have permission to remove this !");
        return res.redirect(`/listings/${id}`);
    }

    next();
};



module.exports.cacheListings = async (req, res, next) => {
    try {
        console.log("i am in cacheListing");
        const { category } = req.query;
        const cacheKey = category ? `listings:${category}` : "listings:all";

        // Check if data exists in Redis cache
        const cachedData = await client.get(cacheKey);

        if (cachedData) {
            console.log("Cache hit");
            return res.render("listings/index.ejs", { alllistings: JSON.parse(cachedData) });
        }

        // If no cached data, proceed to fetch from DB
        req.cacheKey = cacheKey; // Store cacheKey for later use
        next();
    } catch (error) {
        console.error("Redis cache error:", error);
        next(); // Proceed even if Redis fails
    }
};

module.exports.cacheSingleListing = async (req, res, next) => {
    try {
        console.log("I am in cacheSingleListing");
        const cacheKey = `listing:${req.params.id}`;
        const cachedData = await client.get(cacheKey);

        if (cachedData) {
            console.log(`Cache hit: ${cacheKey}`);
            return res.render("listings/show.ejs", { listing: JSON.parse(cachedData) });
        }

        req.cacheKey = cacheKey;
        next();
    } catch (error) {
        console.error("Redis Error:", error);
        next();
    }
};

module.exports.cacheSearch = async (req, res, next) => {
    try {

        console.log(" I am in cacheSearch");
        const { query } = req.query; // Extract the search query from req.query
        console.log(query);
        if (!query) {
            return next(); // If no search query, proceed without caching
        }

        const cacheKey = `search:${query.toLowerCase()}`; // Normalize query for consistency
        const cachedData = await client.get(cacheKey);

        if (cachedData) {
            console.log(`Cache hit: ${cacheKey}`);
            return res.render("listings/index.ejs", { alllistings: JSON.parse(cachedData) });
        }

        req.cacheKey = cacheKey;
        next();
    } catch (error) {
        console.error("Redis Error:", error);
        next();
    }
};



module.exports.clearCache = async (req, res, next) => {
    try {
        await client.flushAll(); // Clears all cache keys
        console.log("Cache cleared!");
    } catch (error) {
        console.error("Error clearing cache:", error);
    }
    next();
};
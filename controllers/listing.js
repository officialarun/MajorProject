const Listing=require("../models/listing.js");
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/tilesets');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); 
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

const client = require("../redis.js");

module.exports.index = async (req, res) => {
    try {
        console.log("I am in index");
        const { category } = req.query;
        let alllistings;

        // Fetch data from DB
        if (category) {
            alllistings = await Listing.find({ category });
        } else {
            alllistings = await Listing.find({});
        }

        // Store data in Redis cache
        if (req.cacheKey) {
            await client.set(req.cacheKey, JSON.stringify(alllistings), { EX: 300 }); // Cache for 5 minutes
        }

        res.render("listings/index.ejs", { alllistings });
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.redirect("/listings");
    }
};

module.exports.renderNewForm=(req,res)=>{
    // console.log(req.user);
    res.render("listings/new.ejs");
};



module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    console.log(id);
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author",},}).populate("owner");
    console.log("Listing Owner ID Type:", typeof listing.owner._id, listing.owner._id);
    

    if(!listing){
        req.flash("error","The listing you are trying to access does not exists");
        res.redirect("/listings");
    }
    // const userId=req.user._id;
    // console.log(userId);

    if (req.cacheKey) {
        await client.set(req.cacheKey, JSON.stringify(listing), { EX: 300 });
    }

    res.render("listings/show.ejs",{listing});
};


module.exports.createListing=async(req,res,next)=>{
    let response=await geocodingClient
        .forwardGeocode({
        query:req.body.listing.location,
        limit: 1,
         })
        .send()

    let url=req.file.path;
    let filename=req.file.filename;
    console.log(url, "..",filename)
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};

    newListing.geometry=response.body.features[0].geometry;

    let savedListing=await newListing.save();
    console.log(savedListing);
    req.flash("success","New listing created!");
    res.redirect("/listings");
};
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","The listing you are trying to access does not exists");
        res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let response=await geocodingClient
    .forwardGeocode({
    query:req.body.listing.location,
    limit: 1,
     })
    .send()
    const { id } = req.params;
    // ✅ Always update other listing fields from req.body.listing
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    listing.geometry=response.body.features[0].geometry;
    await listing.save();
    // ✅ Only update image if a new file is uploaded
    if (req.file) {
        console.log("New image uploaded");
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();  // ✅ Save updated image info
    }

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};




module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","New listing deleted!");
    res.redirect("/listings");

}

 // const updatedData = {
    //   ...req.body.listing,
    //   image: req.body.listing.image ? { url: req.body.listing.image } : undefined,
    //   country: req.body.listing.country?.trim(),
    //   location: req.body.listing.location?.trim(), 
    // };  
    // const updatedListing = await Listing.findByIdAndUpdate(id, updatedData, {
    //   new: true,
    //   runValidators: true,
    // });


    // await Listing.updateMany(
    //     { category: { $exists: false } },  // Finds listings missing category
    //     { $set: { category: "Rooms" } }    // Sets default category
    // );
    // console.log("Updated all old listings with category field!");





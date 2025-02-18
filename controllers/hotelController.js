const Listing = require("../models/listing.js");
const client = require("../redis.js");
const searchListings = async (req, res) => {
    try {
        const { query } = req.query; // Get search input from user

        if (!query) {
            return res.redirect("/listings"); // Redirect if empty search
        }

        // Search for listings with a fuzzy match (case-insensitive)
        const listings = await Listing.find({
            $or: [
                { title: { $regex: query, $options: "i" } },  // Case-insensitive match
                { location: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ]
        });
        if (req.cacheKey) {
            await client.set(req.cacheKey, JSON.stringify(listings), { EX: 300 });
        }
        res.render("listings/index.ejs", { alllistings:listings });
    } catch (error) {
        console.error("Search error:", error);
        res.redirect("/listings");
    }
};

module.exports = { searchListings };


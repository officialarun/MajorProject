const Payment = require("../models/payment.js");
const Listing = require("../models/listing.js");

const getUserPayments = async (req, res) => {
    try {
        const userId = req.params.id;
        // console.log(req.params);
        // console.log("✅ req.user:", req.user);
        // console.log("✅ req.user._id.toString():", req.user?._id.toString());
        // console.log("✅ userId:", userId);

        
        if (!req.user || req.user._id.toString() !== userId) {
           return res.redirect("/login");
        }

        const payments = await Payment.find({ userId }).populate("listingId");

        res.render("bookings/yourBookings.ejs", { payments });
    } catch (error) {
        console.error("❌ Error fetching user payments:", error);
        res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

module.exports = { getUserPayments };




const Razorpay = require("razorpay");
const Payment = require("../models/payment.js");
const Listing = require("../models/listing.js");

const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

const createOrder = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, msg: "Unauthorized. Please log in." });
            
            
        }

        const { listingId } = req.params;
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, msg: "Listing not found" });
        }

        const amount = listing.price * 100; // Convert to paise

        const options = {
            amount,
            currency: "INR",
            receipt:  `order_${req.user._id.toString().slice(-6)}_${listingId.slice(-6)}`,
            notes: { userId: req.user._id.toString(), listingId: listingId }
        };

        // 🔹 Create order with Razorpay
        const order = await razorpayInstance.orders.create(options);

        // 🔹 Store order in database
        const newPayment = new Payment({
            userId: req.user._id,
            listingId,
            razorpay_order_id: order.id,
            amount: listing.price,
            status: "created"
        });

        await newPayment.save();

        res.status(200).json({
            success: true,
            msg: "Order Created",
            order_id: order.id,
            amount,
            key_id: RAZORPAY_ID_KEY,
            name: listing.title,
            description: listing.description,
            contact: req.user.phone || "N/A",
            email: req.user.email
        });

    } catch (error) {
        console.error("❌ Error creating order:", error);
        res.status(500).json({ success: false, msg: "Internal server error" });
    }
};






const confirmPayment = async (req, res) => {
    try {
        const { order_id, payment_id, signature } = req.body;
        console.log("this is order id for payment:",req.body);
        console.log("ye sconfirmation reciieved");

        const payment = await Payment.findOne({ razorpay_order_id: order_id });
        if (!payment) {
            console.log("id not found");
            return res.status(404).json({ success: false, msg: "Order not found" });
        }

        payment.razorpay_payment_id = payment_id;
        payment.razorpay_signature = signature;
        payment.status = "paid";
        await payment.save();

        res.status(200).json({ success: true, msg: "Payment recorded" });
    } catch (error) {
        console.error("❌ Error confirming payment:", error);
        res.status(500).json({ success: false, msg: "Internal server error" });
    }
};



const crypto = require("crypto");

const razorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_SECRET;
        const webhookSignature = req.headers["x-razorpay-signature"];
        const body = JSON.stringify(req.body);

        // 🔹 Validate Razorpay webhook signature
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== webhookSignature) {
            console.warn("⚠️ Invalid Razorpay webhook signature!");
            return res.status(400).json({ success: false, msg: "Invalid signature" });
        }

        console.log("✅ Webhook signature verified!");

        const { event, payload } = req.body;
        if (event === "payment.captured") {
            const paymentId = payload.payment.entity.id;
            const orderId = payload.payment.entity.order_id;
            // const amount = payload.payment.entity.amount / 100; // Convert from paise to INR

            // Find the payment record in the database
            const payment = await Payment.findOne({ razorpay_order_id: orderId });

            if (!payment) {
                console.warn("⚠️ Payment record not found for order:", orderId);
                return res.status(404).json({ success: false, msg: "Payment record not found" });
            }

            // Update payment status
            payment.razorpay_payment_id = paymentId;
            payment.status = "paid";
            await payment.save();
            console.log("webhook record saved");

            console.log("✅ Payment updated in database:", payment);

            return res.status(200).json({ success: true, msg: "Payment verified and recorded" });
        }

        res.status(400).json({ success: false, msg: "Unhandled webhook event" });
    } catch (error) {
        console.error("❌ Error handling webhook:", error);
        res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

module.exports = { createOrder, confirmPayment, razorpayWebhook };





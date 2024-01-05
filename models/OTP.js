const mongoose = require("mongoose");
const  mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema
({
    email:
    {
        type:String,
        required:true,
    },
    otp:
    {
        type:String,
        required:true,
    },
    createAt:
    {
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
    

    

});

//function->to send email
async function sendVerficationEmail(email,otp)
{
    try
    {
        const mailResponse = await mailSender(email,"Verfication Email from from Study",otp);
        console.log("Email sent Successfully :",mailResponse);

    }
    catch(error)
    {
        console.log("error occured  while sending mails:",error);
        throw error;

    }

}
OTPSchema.pre("save",async function(next){
    await sendVerficationEmail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("OTP",OTPSchema);
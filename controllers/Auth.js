const User  = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

//sendOTP
exports.sendOTP = async(req,res)=>
{
    try
    {
    const {email} = req.body;
    const checkUserPresent = await User.findOne({email});
    if(checkUserPresent)
    {
        return res.status(401).json({
            success:false,
            message:'User already registered',
        })
    }
    var otp = otpGenerator.generator(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    });
    console.log("otp generated",otp);

    const result  = await OTP.findOne({otp:otp});

    while(result)
    {
        otp = otpGenerator(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        result = await OTP.findOne({otp:otp});
    }
     const otpPayload = {email,otp}; 
     const otpBody = await OTP.create(otpPayload);
     console.log(otpBody);

     res.status(200).json({
        success:true,
        message:'OTP Sent Successfully',
        otp,
     })

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

//signUp

exports.signUp = async(req,res)=>
{
    try
    {

    
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp

    }=req.body;

    if(!firstName || !lastName || !email || !password || !confirmPassword ||!otp)
    {
        return res.status(403).json({
            success:true,
            message:"All fields are required",
        })

    }

    if(password!=confirmPassword)
    {
        return res.status(400).json({
            success:false,
            message:'Password and ConfirmPssword Value does not match,please try again'
        });

    }
    const  existingUser = await  User.findOne({email});
    if(existingUser)
    {
        return res.status(400).json({
            success:false,
            message:'User is already registered',
        });
    }

    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);

    console.log(recentOtp);
    if(recentOtp.length==0)
    {
        return res.status(400).json({
            success:false,
            message:'OTP NOT Found',
        })

    }
    else if(otp!==recentOtp.otp)
    {
        return  res.status(400).json({
            success:false,
            message:"Invalid OTP",

        })
    }
    const hashedPassword = await bcrypt.hash(password,10);

    const ProfileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    });
    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:ProfileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstname}%20${lastName}`,
    });
    return res.status(200).json({
        success:true,
        message:'User is registered Successfully',
        user,
    });

}
catch(error)
{
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"User cannot be registered. Please try again",
    })

}
}




//Login

exports.login = async(req,res)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password)
        {
            return res.status(403).json({
                success:false,
                message:'All fields are required, please try again',

            });
        }

        const user  = await User.findOne({email}).populate("additionalDetails");

        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            });
        }
        if(await bcrypt.compare(password,user.password))
        {
            const payload ={
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;

            const options = {
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in succcessfully",
            })

        }
        else
        {
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',

            });
        }
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again'
        });
    }

};



//changePassword
exports.changePassword = async (req,res)=>
{
    //get data from req body
    //get oldpassword , newpassword, confirmpassword
    //validation
    //update password in db
    //send mail
    //return response
    try {
        //Get user data from req.user
        const userDetails = await User.findById(req.user.id);
        
        //get oldPassword, newPassword
        const {oldPassword, newPassword} = req.body;

        //Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword, 
            userDetails.password
        );

        if(!isPasswordMatch) {
            //if old password does not match, return a 401 (unauthorized) error
            return res
                .status(401)
                .json({
                success: false,
                message: 'The Password is Incorrect',
            })
        }

        //update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        //send notification email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                `Password Updated Successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
                passwordUpdated(
                    updatedUserDetails.email,
                    updatedUserDetails.firstName,
                )
            )
            console.log('Email sent successfully................', emailResponse);
        } catch (error) {
            //if there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.log('Error Occurred While Sending Email: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error Occurred While Sending Email',
                error: error.message,
            });
        }

        //Return success response
        return res
            .status(200)
            .json({ success: true, message: 'Password Updated Successfully' });

    } catch (error) {
        //if there's an error updating the password, log the error and return 500 (Internal Server Error) error
        console.error('Error Occurred While Updating Password', error);
        return res.status(500).json({
            success: false,
            message: 'Error Occurred While Updating Password',
            error: error.message,
        });
    }
}



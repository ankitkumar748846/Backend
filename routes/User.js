const {
    login,
    signup,
    sendotp,
    changepassword,
} = require("../controllers/Auth");



const   {
    resetPasswordToken,
    resetPassword,
} = require("../controllers/ResetPassword");

const {auth} = require("../middlewares/auth");

//Route for user login
router.post("/login",login);
//Route for user signup
router.post("/signup",signup);
//Route for sending otp to the users email
router.post("/sendotp",sendotp);
//Route for changing the password
router.post("/changepassword",auth, changePassword);

//Route for generating a reset password token
router.post('/reset-password-token', resetPasswordToken);
//Router for resetting user password after verfication
router.post('/reset-password', resetPassword);

module.exports = router;
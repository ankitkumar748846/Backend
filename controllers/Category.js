const Tag = require("../models/Category");
//create tag
exports.createCategory = async(req,res)=>{
    try{
        //fetch data
        const {name,description} = req.body;
        //validation
        if(!name || !description)
        {
            return res.status(400).json({
                success:true,
                message:'All fields are required',
                
            });
        }
        //create entry in db
        const categoryDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(categoryDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"Category created successfully",
        })

    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};


//getalltags handler
exports.showAllCategory = async(req,res)=>{
    try
    {
        const allCategory = await Tag.find({},{name:true, description:true});
        res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            allCategory,
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:true,
            message:error.message,
        })
    }
}


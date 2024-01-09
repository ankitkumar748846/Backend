const Category = require("../models/Category");
//create category
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
exports.showAllCategories = async(req,res)=>{
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

//categoryPageDetails.
exports.categoryPageDetails = async(req,res) =>{
    try
    {
        //get categoryid
        const {categoryId} = req.body;


        //get courses  for specified categoryid
        const selectedCategory = await Category.findById(categoryId)
                                  .populate("courses")
                                  .exec();

        //validation
        if(!selectedCategory)
        {
            return res.status(404).json({
                success:false,
                message:'Data not found',
            });
        }
        // get courses for different categories
        const differentCategories = await Category.find({
                                    _id:{$ne:categoryId},
                                    })
                                    .populate("courses")
                                    .exec();
        
         //get top selling courses
         //return response
         return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
            },
         });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}




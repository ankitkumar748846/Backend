const Section = require("../models/Section");
const Course = require("../models/Course");
exports.createSection = async(req,res) =>{
    try
    {
        //data fetch
        const {sectionName , courseId} = req.body;
        //data validation
        if(!sectionName || !courseId)
        {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        } 
        //create  new section
        const newSection = await Section.create({sectionName});

        //update course with section objectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        )
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            },

        })
        .exec();
        //return response
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails,
        });


    }
    catch(error){
        return  res.status(500).json({
            success:false,
            message:'Unable to create section, please try again',
            error:error.message,
        });


    }
}

//updatesection
exports.updateSection = async(req,res) =>{
    try{
        //data fetch
        const {sectionName , sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId)
        {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

        //return res
        return res.status(200).json({
            success:true,
            message:'Section Updated successfully',
        });

    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Unable to update section, please try again',
            error:error.message,
        });

    }
}


//delete section
exports.deleteSection = async(req,res) =>{
    try{
        //get Id
        const {sectionId} = req.body;
        //use findByIdandDelete
        await Section.findByIdAndDelete(sectionId);
        return res.status(500).json({
            success:true,
            message:'Section Deleted successfully',
        });
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Unable to delete section, please try again',
            error:error.message,
        });
    }
}
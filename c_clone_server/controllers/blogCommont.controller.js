const BlogComment = require('../models/blogCommont.model')
const Blog = require('../models/blog.model')

exports.createBlogComment = async (req, res) => {
    try {
        // console.log("req.body",req.body)
        const { blogId, comment, userId } = req.body;
        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: "Blog id is required"
            })
        }
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: "Comment is required"
            })
        }
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User id is required"
            })
        }

        const blogComment = new BlogComment({
            blogId,
            comment,
            userId
        })

        await blogComment.save()

        await Blog.findByIdAndUpdate(blogId, { $push: { comments: blogComment._id } });

        res.status(200).json({
            success: true,
            message: "Blog comment created successfully",
            data: blogComment
        })

    } catch (error) {
        console.log("Internal server error in doing commonts");
        res.status(500).json({
            success: false,
            message: "Internal server error in doing comments",
            error: error.message
        })
    }
}

exports.getAllComments = async (req, res) => {
    try {
        const BlogComments = await BlogComment.find().populate("userId").populate("blogId")
        if (!BlogComments) {
            return res.status(404).json({
                success: false,
                message: "No comments found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Comments retrieved successfully",
            data: BlogComments
        })
    } catch (error) {
        console.log("Internal server error in getting all comments", error);
        res.status(500).json({
            success: false,
            message: "Internal server error in getting all comments",
            error: error.message
        })
    }
}

exports.getBlogCommentByBlogId = async (req,res) => {
    try {
        const {blogId} = req.params;
        const blogComment = await BlogComment.find({blogId:blogId}).populate("userId").populate('blogId')
        if(!blogComment){
            return res.status(400).json({
                success: false,
                message: "No comments found for this blog"
            })
        }
        res.status(201).json({
            success: true,
            message: "Comments retrieved successfully",
            data: blogComment
        })
    } catch (error) {
        console.log("Internal server error in getting blog comment by blog id",error);
        res.status(500).json({
            success: false,
            message: "Internal server error in getting blog comment by blog id",
            error: error.message
        })
    }
}

exports.deleteBlogComment = async (req,res) => {
    try {
        const {id} = req.params;
        const blogComment = await BlogComment.findByIdAndDelete(id);
        if(!blogComment){
            return res.status(400).json({
                success: false,
                message: "Comment not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        })
    } catch (error) {
        console.log("Internal server error in deleting blog comment",error);
        res.status(500).json({
            success: false,
            message: "Internal server error in deleting blog comment",
            error: error.message
        })
    }
}
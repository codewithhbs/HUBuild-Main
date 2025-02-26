import React, { useEffect, useState } from "react";
import BreadCrumbs from "../../components/BreadCrumbs";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { GetData } from "../../utils/sessionStoreage";
import Swal from "sweetalert2";

const BlogSingle = () => {
  const location = new URLSearchParams(window.location.href);
  const title = location.get("blogTitle");
  const { id } = useParams();
  const Data = GetData('user')
  const UserData = JSON.parse(Data)
  const [data, setData] = useState([])
  // const userId = UserData._id;
  const [formData, setFormData] = useState({
    blogId: id,
    comment: "",
    userId: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const fetchBlogData = async () => {
    try {
      const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/get-single-blog/${id}`)
      setData(data.data)
    } catch (error) {
      console.log("Internal server error in fetching blog data");
      toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
    }
  }

  useEffect(() => {
    fetchBlogData();
  }, [])

  const handleComment = async (e) => {
    e.preventDefault();
    if (!UserData) {
      // return toast.error('Please login to comment')
      return Swal.fire({
        title: 'Error!',
        text: 'Please login to comment',
        icon: 'error', // use lowercase
        confirmButtonText: 'Okay'
      });
    }
    const newFormData = {
      ...formData,
      userId: UserData?._id,
      blogId: id
    }
    try {
      const res = await axios.post('https://api.helpubuild.co.in/api/v1/create-blog-comment', newFormData)
      // toast.success("Comment added successfully");
      Swal.fire({
        title: 'Success!',
        text: "Comment added successfully",
        icon: 'success', // use lowercase
        confirmButtonText: 'Okay'
      });
      setFormData({
        comment: ""
      })
    } catch (error) {
      console.log("Internal server error", error)
      // toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
      Swal.fire({
        title: 'Error!',
        text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later",
        icon: 'error', // use lowercase
        confirmButtonText: 'Okay'
      });
    }
  }

  return (
    <div>
      <BreadCrumbs path={"Blog-Details"} title={title} />

      <section class="as_blog_wrapper as_padderBottom90 as_padderTop80">
        <div class="container">
          <div class="row">
            <div class="col-lg-9 col-md-10 col-sm-12 col-xs-12">
              <div class="as_blog_box">
                <div class="as_blog_img">
                  <a>
                    <img
                      src={data?.largeImage?.url}
                      alt={data.title}
                      class="img-responsive"
                    />
                  </a>
                  <span class="as_btn">{new Date(data.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }) || "Not-Available"}</span>
                </div>
                <div class="as_blog_detail">
                  <ul>
                    <li>
                      <a href="javascript:;">
                        <img src="assets/images/svg/user2.svg" alt="" />
                        By - {data.writer}
                      </a>
                    </li>

                  </ul>
                  <h4 className=" fs-2 fw-bold as_subheading">
                    {" "}
                    {data.title}
                  </h4>
                  <p class="as_font14 as_margin0 as_padderBottom10" dangerouslySetInnerHTML={{ __html: data.content }} ></p>



                </div>

                <div class="as_comment_form p-5">
                  <div class="as_padderBottom40">
                    <h1 class="as_heading">Leave a Comment</h1>
                  </div>

                  <div class="row">
                    <form onSubmit={handleComment}>
                      <div class="col-lg-12 col-md-12">
                        <div class="form-group">
                          <textarea
                            name='comment'
                            value={formData.comment}
                            class="form-control"
                            onChange={handleChange}
                            placeholder="Your Message"
                          ></textarea>
                        </div>
                      </div>
                      <div class="col-lg-12 col-md-12 as_padderTop10">
                        <button onSubmit={handleComment} class="as_btn">
                          send
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogSingle;

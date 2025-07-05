import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BreadCrumbs from "./BreadCrumbs";
import toast from "react-hot-toast";
import axios from "axios";

const Blog = () => {
  const [show, setShow] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/blog") {
      setShow(true);
    }
  }, [location]);
  const [data, setData] = useState([])

  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get('https://api.helpubuild.in/api/v1/get-all-blog')
      const blogs = data.data
      const reversedBlogs = blogs.reverse();
      setData(reversedBlogs)
      // setData
    } catch (error) {
      console.log("Internal server error in getting blogs");
      // toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later")
    }
  }

  useEffect(() => {
    fetchBlogs()
  },[])

  return (
    <div>
      {show && <BreadCrumbs path={"Blog"} title={"Latest Articles"} />}

      <section className="as_blog_wrapper as_padderTop80 as_padderBottom80">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12 text-center">
              <h1 className="as_heading">Latest Articles</h1>
              <p className="as_font14 as_padderBottom10">
                Stay updated with our latest insights and tips on architecture,
                interior design, and Vastu.
              </p>

              <div className="v3_blog_wrapper">
                <div className="row text-left" data-aos="fade-up" data-aos-offset="300" data-aos-easing="ease-in-sine">
                  {data && data.slice(0, 3).map((post, index) => (
                    <Link
                      to={`/blog-details/${post._id}`}
                      key={index}
                      className="col-lg-4 col-md-6 col-sm-6 col-12"
                    >
                      <div className="as_blog_box">
                        <div className="as_blog_img">
                          <a href={`${post.href}`}>
                            <img
                              src={post?.image?.url}
                              alt={post.title}
                              className="img-responsive forblogheight"
                            />
                          </a>
                          <span className="as_btn">{new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }) || "Not-Available"}</span>
                        </div>
                        <div className="as_blog_detail">
                          <ul>
                            <li>
                              <a style={{ color: "black" }}>
                                <img src="assets/images/svg/user2.svg" alt="" />
                                By - {post.writer}
                              </a>
                            </li>
                            <li>
                              <a style={{ color: "black" }}>
                                <img
                                  src="assets/images/svg/comment1.svg"
                                  alt=""
                                />
                                {post.comments.length} comments
                              </a>
                            </li>
                          </ul>
                          <h4 className="as_subheading ">
                            <Link className="two-line-clamp" style={{ color: "black" }} to={`/blog-details/${post._id}`}>
                              {post.title}
                            </Link>
                          </h4>
                          <p style={{ color: "black" }} className="as_font14 as_margin0 two-line-clamp">{post.smallDesc}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="text-center as_padderTop60">
                <Link to="/blog" className="as_btn">
                  View More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;

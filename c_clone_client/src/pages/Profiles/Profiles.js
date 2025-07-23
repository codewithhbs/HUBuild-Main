import React, { useEffect, useState } from 'react';
import { BiLocationPlus } from 'react-icons/bi';

const Profiles = () => {
    const location = new URLSearchParams(window.location.search);
    const [pageType, setPageType] = useState([]);
    const [vastu, setVastu] = useState([]);

    const query = location.get("page");

    useEffect(() => {
        if (query === "interior") {
            setPageType(InteriorDesignProfile);
        } else if (query === "Architecture") {
            setPageType(ArchitectProfile);
        } else {
            setVastu(vastuProfiles);
        }
    }, [query]);

    const ArchitectProfile = [
        {
            id: 1,
            image: "https://st2.depositphotos.com/3433891/6999/i/450/depositphotos_69995049-stock-photo-architect-man-with-planes.jpg",
            qualification: "Masters in Architecture",
            expertise: "Urban Design, Sustainable Architecture",
            language: ["English", "Spanish"],
            experience: "10 years",
            location: "New York, USA",
            name: "name1",
        },
        {
            id: 2,
            image: "https://st3.depositphotos.com/1049680/34974/i/450/depositphotos_349741534-stock-photo-young-handsome-chinese-architect-man.jpg",
            qualification: "Bachelor in Architecture",
            expertise: "Residential Projects, Interior Design",
            language: ["English"],
            experience: "7 years",
            location: "San Francisco, USA",
            name: "name1",
        },
        {
            id: 3,
            image: "https://thumbs.dreamstime.com/b/proud-architect-white-background-slight-side-upper-body-view-young-man-crossed-arms-white-shirt-tie-white-178208897.jpg",
            qualification: "Master's in Architecture",
            expertise: "Commercial Spaces",
            language: ["English", "French"],
            experience: "8 years",
            location: "Chicago, USA",
            name: "name1",
        },
        {
            id: 4,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREHmzH_pMA2OWLRlYl3JKS-fBi19alDiBKTEW0JFjdsyi_6OX5UcyqBWTY8UramjU8P8k&usqp=CAU",
            qualification: "Bachelor of Architecture",
            expertise: "Sustainable Design",
            language: ["English", "German"],
            experience: "6 years",
            location: "Los Angeles, USA",
            name: "name1",
        },
        {
            id: 5,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5AK37Tvpj2kj5f1GhpiNgs4Qj8fy7P4y2pnwLIkPVjQ-RlA8CkqtODS1uP2EH-6qO5h8&usqp=CAU",
            qualification: "Master's in Urban Design",
            expertise: "Urban Planning",
            language: ["English", "Hindi"],
            experience: "12 years",
            location: "Boston, USA",
            name: "name1",
        }
    ];

    const InteriorDesignProfile = [
        {
            id: 1,
            image: "https://st2.depositphotos.com/3433891/6999/i/450/depositphotos_69995049-stock-photo-architect-man-with-planes.jpg",
            qualification: "Masters in Interior Design",
            expertise: "Modern Interiors, Space Optimization",
            language: ["English", "Hindi"],
            experience: "9 years",
            location: "Los Angeles, USA",
            name: "name1",
        },
        {
            id: 2,
            image: "https://st3.depositphotos.com/1049680/34974/i/450/depositphotos_349741534-stock-photo-young-handsome-chinese-architect-man.jpg",
            qualification: "Bachelor in Interior Design",
            expertise: "Residential Interiors",
            language: ["English"],
            experience: "5 years",
            location: "Chicago, USA",
            name: "name1",
        },
        {
            id: 3,
            image: "https://i.ibb.co/MctRHw4/image.png",
            qualification: "Master's in Design",
            expertise: "Luxury Interiors",
            language: ["English", "French"],
            experience: "7 years",
            location: "Miami, USA",
            name: "name1",
        },
        {
            id: 4,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREHmzH_pMA2OWLRlYl3JKS-fBi19alDiBKTEW0JFjdsyi_6OX5UcyqBWTY8UramjU8P8k&usqp=CAU",
            qualification: "Bachelor of Interior Design",
            expertise: "Commercial Interiors",
            language: ["English", "German"],
            experience: "6 years",
            location: "New York, USA",
            name: "name1",
        },
        {
            id: 5,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5AK37Tvpj2kj5f1GhpiNgs4Qj8fy7P4y2pnwLIkPVjQ-RlA8CkqtODS1uP2EH-6qO5h8&usqp=CAU",
            qualification: "Master's in Interior Architecture",
            expertise: "Historic Renovations",
            language: ["English", "Spanish"],
            experience: "11 years",
            location: "San Francisco, USA",
            name: "name1",
        }
    ];

    const vastuProfiles = [
        {
            id: 1,
            image: 'https://i.ibb.co/3NYnt7d/image.png',
            name: 'Name 1',
            title: 'Logical Vastu',
            language: ["English", "Hindi"],
            experience: "9 years",
            price: "20/Min",
            location: 'India, Country'
        },
        {
            id: 2,
            image: 'https://i.ibb.co/3NYnt7d/image.png',
            name: 'Name 2',
            title: 'Logical Vastu',
            language: ["English", "Hindi"],
            experience: "9 years",
            price: "20/Min",
            location: 'India, Country'
        },
        {
            id: 3,
            image: 'https://i.ibb.co/3NYnt7d/image.png',
            name: 'Name 3',
            title: 'Logical Vastu',
            language: ["English", "Hindi"],
            experience: "9 years",
            price: "20/Min",
            location: 'India, Country'
        },
        {
            id: 4,
            image: 'https://i.ibb.co/3NYnt7d/image.png',
            name: 'Name 4',
            title: 'Logical Vastu',
            language: ["English", "Hindi"],
            experience: "9 years",
            price: "20/Min",
            location: 'India, Country'
        },
        {
            id: 5,
            image: 'https://i.ibb.co/3NYnt7d/image.png',
            name: 'Name 5',
            title: 'Logical Vastu',
            language: ["English", "Hindi"],
            experience: "9 years",
            price: "20/Min",
            location: 'India, Country'
        }
    ];

    return (
        <div className='container custom-container basic_detail_form mx-auto'>
            <div className="v3_blog_wrapper basic_detail_form">
                {/* Heading based on pageType */}
                <h2 className="text-center mb-4">
                    {query === "interior" ? "Interior Design Profiles" :
                     query === "Architecture" ? "Architect Profiles" :
                     "Vastu Profiles"}
                </h2>
                <div className="row text-left">
                    {(pageType.length > 0 ? pageType : vastu).map((post) => (
                        <div
                            key={post.id}
                            className="col-lg-4 col-md-6 col-sm-6 col-12"
                        >
                            <div className="as_blog_box">
                                <div className="as_blog_img">
                                    <a href="#" className='text-center d-flex align-items-center justify-content-center'>
                                        <img
                                            src={post.image}
                                            alt={post.name}
                                            className="img-responsive img-fixs rounded-circle"
                                        />
                                    </a>
                                    <span className="as_btn">{post.experience}</span>
                                </div>
                                <div className="as_blog_detail">
                                    <ul>
                                        <li>
                                            <a>
                                                <img src="assets/images/svg/user2.svg" alt="" />
                                                {post.name}
                                            </a>
                                        </li>
                                        <li>
                                            <a>
                                                <img
                                                    src="assets/images/svg/comment1.svg"
                                                    alt=""
                                                />
                                                {post.language.join(", ")}
                                            </a>
                                        </li>
                                        <li>
                                            <a>
                                                <img
                                                    src="assets/images/svg/calender1.svg"
                                                    alt=""
                                                />
                                                {post.price}
                                            </a>
                                        </li>
                                        <li>
                                            <a>
                                                <img
                                                    src="assets/images/svg/heart1.svg"
                                                    alt=""
                                                />
                                               <BiLocationPlus/> {post.location}
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profiles;

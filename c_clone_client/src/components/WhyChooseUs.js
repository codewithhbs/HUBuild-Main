import React from 'react'

const WhyChooseUs = () => {
    return (
        <div>
            <section className="as_whychoose_wrapper">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 text-center">
                            <h1 className="as_heading why_choose_heading">Why Choose <span className='about_color'>Help U Build</span></h1>
                            <p className="as_font14 as_padderBottom50 mx-auto why-sub-para">Choose Help U Build for expert architecture, interior design, and Vastu solutions, blending modern innovation with traditional wisdom.</p>
                        </div>
                        <div className="col-lg-12">
                            <div className="row mx-auto chooseColParent" data-aos="fade-up" data-aos-offset="300" data-aos-easing="ease-in-sine">
                                <div className="col-lg-3 chooseColChild text-center col-md-3 col-sm-12 mb-4">
                                    <div style={{display:'flex'}} className="as_whychoose_box flex-column align-content-center jus  text-center">
                                        <span className="as_number">
                                            <img src="https://cdn-icons-png.flaticon.com/512/1828/1828652.png" alt="" />
                                        </span>
                                        <h4 className=''>Verified Professionals</h4>
                                    </div>
                                </div>
                                <div className="col-lg-3 chooseColChild col-md-3 col-sm-12 mb-4">
                                    <div className="as_whychoose_box text-center">
                                        <span className="as_number">
                                            <img src="https://cdn-icons-png.flaticon.com/512/9023/9023721.png" alt="" />
                                        </span>
                                        <h4 className=''>Transparent Pricing</h4>
                                    </div>
                                </div>
                                <div className="col-lg-3 chooseColChild col-md-3 col-sm-12 mb-4">
                                    <div className="as_whychoose_box text-center">
                                        <span className="as_number">
                                            <img src="https://cdn-icons-png.flaticon.com/512/18188/18188344.png" alt="" />
                                        </span>
                                        <h4 className=''>Expertise and Experience</h4>
                                    </div>
                                </div>
                                <div className="col-lg-3 chooseColChild col-md-3 col-sm-12 mb-4">
                                    <div className="as_whychoose_box text-center">
                                        <span className="as_number">
                                            <img src="https://cdn-icons-png.flaticon.com/512/1076/1076119.png" alt="" />
                                        </span>
                                        <h4 className=''>Customized Solutions</h4>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    )
}

export default WhyChooseUs

import React from 'react'
import BreadCrumbs from '../../components/BreadCrumbs'

const Contact = () => {
    return (
        <div>
            <BreadCrumbs path={"Contact"} title={"Contact Us"} />


            <section class="as_contact_wrapper as_padderBottom40 as_padderTop50">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-12 text-center">
                            <h1 class="as_heading as_heading_center">get in touch with us!</h1>

                            <p class="as_font14 as_padderBottom50 as_padderTop20">We'd love to hear from you! Whether you have questions, need assistance, our team is here to help.</p>
                        </div>
                        <div class="col-lg-6 col-md-6 col-sm-12">
                            <div class="as_contact_detail">
                                <ul>
                                    <li class="as_info_box">
                                        <span class="as_icon">
                                            <img src="assets/images/svg/pin.svg" alt="" />
                                        </span>
                                        <p> E-520A, 3rd Floor, Sector 7, Dwarka, New Delhi- 110075</p>
                                    </li>
                                    <li class="as_info_box">
                                        <span class="as_icon">
                                            <img src="assets/images/svg/contact.svg" alt="" />
                                        </span>
                                        <p>+91 8826465693</p>
                                    </li>
                                    <li class="as_info_box">
                                        <span class="as_icon">
                                            <img src="assets/images/svg/message.svg" alt="" />
                                        </span>
                                        <p><a href="javascript:;">info@helpubuild.in  </a></p>
                                    </li>
                                </ul>
                                <div class="as_map">
                                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.492516315673!2d77.06982277522413!3d28.584997986238168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b8edcfcd7f9%3A0x74a42210a33d0b1d!2sPandit%20Buildwell%20%7C%20Best%20Architects%20and%20Interior%20Designer%20in%20Delhi!5e0!3m2!1sen!2sin!4v1733481938019!5m2!1sen!2sin" width="100%" height="318" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6 col-md-6">
                            <form class="as_appointment_form">
                                <div class="form-group">
                                    <input type="text" name="" value="" placeholder="Name" class="form-control" />
                                </div>
                                <div class="form-group">
                                    <input type="text" name="" value="" placeholder="Last Name" class="form-control" />
                                </div>
                                <div class="form-group">
                                    <input type="text" name="" value="" placeholder="Email Address" class="form-control" />
                                </div>
                                <div class="form-group">
                                    <input type="text" placeholder="Subject" class="form-control" />
                                </div>
                                <div class="form-group as_padderBottom10">
                                    <textarea name="" class="form-control" placeholder="Message" id=""></textarea>
                                </div>
                                <button class="as_btn">Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Contact

import React, { useEffect, useState } from 'react';
import './Basic.css';

function Basic_details() {
    const location = new URLSearchParams(window.location.search);
    const [pageType, setPageType] = useState("");
    const query = location.get("page");

    useEffect(() => {
        if (query === "Architecture") {
            setPageType("Architecture");
        } else if (query === "Interior") {
            setPageType("Interior");
        } else {
            alert("Invalid query parameter");
        }
    }, [query]);
    return (
        <div className="basic_detail_form">

            {pageType === 'Architecture' ? (
                <div className="container custom-container mx-auto mt-md-5">
                    <div className="row">
                        <div className="col-md-10">
                            <div className="heading">
                                <h3>Consultation With Experts : Desso Build</h3>
                            </div>

                            <div className="form-elements p-4 shadow-lg rounded">
                                <div className="form bg-light p-3 rounded">
                                    <form>
                                        {/* Project Type Section */}
                                        <div className="form-group row mb-4">
                                            <label htmlFor="projectType" className="col-form-label col-12 mb-2 font-weight-bold">
                                                <span>Project Type</span>
                                            </label>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        name="projectType"
                                                        value="Residential"
                                                        className="form-check-input"
                                                        required
                                                        id="Residential"
                                                    />
                                                    <label className="form-check-label" htmlFor="Residential">
                                                        Residential
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        name="projectType"
                                                        value="Commercial"
                                                        className="form-check-input"
                                                        required
                                                        id="Commercial"
                                                    />
                                                    <label className="form-check-label" htmlFor="Commercial">
                                                        Commercial
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        name="projectType"
                                                        value="Landscape"
                                                        className="form-check-input"
                                                        required
                                                        id="Landscape"
                                                    />
                                                    <label className="form-check-label" htmlFor="Landscape">
                                                        Landscape
                                                    </label>
                                                </div>
                                            </div>
                                        </div>


                                        {/* Area and Width Section */}
                                        <div className="form-group row mb-4">
                                            <div className="col-md-6 ">
                                                <div className="form-check w-100">
                                                    <input type="checkbox" className="form-check-input" id="AreaCheckbox" />
                                                    <label className="form-check-label ml-2" htmlFor="AreaCheckbox">
                                                        Area
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Your Area"
                                                        className="form-control mt-2"
                                                        required
                                                        id="areaInput"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6 ">
                                                <div className="form-check w-100">
                                                    <input type="checkbox" className="form-check-input" id="Budget" />
                                                    <label className="form-check-label ml-2" htmlFor="WidthCheckbox">
                                                        budget
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Your budget"
                                                        className="form-control mt-2"
                                                        required
                                                        id="budget"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Services CheckBoxes */}
                                        <div className="form-group row mb-4">
                                            <label htmlFor="servicesType" className="col-form-label col-12 mb-2 font-weight-bold">
                                                <span>Services Type</span>
                                            </label>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id="projectEstimation" />
                                                    <label className="form-check-label" htmlFor="projectEstimation">
                                                        Project Estimation
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id="conceptDesign" />
                                                    <label className="form-check-label" htmlFor="conceptDesign">
                                                        Concept Design
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id="detailDesign" />
                                                    <label className="form-check-label" htmlFor="detailDesign">
                                                        Detail Design
                                                    </label>
                                                </div>
                                            </div>


                                            {/* <input type="checkbox" className="form-check-input" id="buildingServices" /> */}
                                            <label htmlFor="servicesType" className="col-form-label col-12 mb-2 font-weight-bold">
                                                <span>Building Services</span>
                                            </label>


                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id="electricalPlumbing" />
                                                    <label className="form-check-label" htmlFor="electricalPlumbing">
                                                        Electrical & Plumbing
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id="acOcv" />
                                                    <label className="form-check-label" htmlFor="acOcv">
                                                        AC & CCTV
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id="fireSafety" />
                                                    <label className="form-check-label" htmlFor="fireSafety">
                                                        Fire Safety
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id="2DLayout" />
                                                    <label className="form-check-label" htmlFor="2DLayout">
                                                        2D Layout
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id="3DLayout" />
                                                    <label className="form-check-label" htmlFor="3DLayout">
                                                        3D Layout
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id="structuralDrawings" />
                                                    <label className="form-check-label" htmlFor="structuralDrawings">
                                                        Approved Structural Drawings
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id="buildingPlanApproval" />
                                                    <label className="form-check-label" htmlFor="buildingPlanApproval">
                                                        Building Plan Approval
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Inputs Section */}
                                        <div className="form-group row mb-4">
                                            <div className="col-md-12">
                                                <label htmlFor="Additional Services" className="col-form-label font-weight-bold">
                                                    Additional Services
                                                </label>
                                                <input type="text" className="form-control mt-2" id="AdditionalServices" />
                                            </div>

                                        </div>
                                        <div className="container ">

                                            <a href={'/profile-details?page=Architecture'} className="buttons as_btn">Submit  </a>

                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ) : (
                <div className="container mt-5">
                    <div className="row">
                        <div className="col-md-10">


                            <div className="form-elements p-4 shadow-lg rounded">
                                <div className="form bg-light p-3 rounded">
                                    <form>
                                        {/* Project Type Section */}
                                        <div className="form-group row mb-4">
                                            <label htmlFor="projectType" className="col-form-label col-12 mb-2 font-weight-bold">
                                                <span>Project Type</span>
                                            </label>
                                            <div className="col-md-12 mb-2">
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        name="projectType"
                                                        className="form-check-input"
                                                        required
                                                        id="Residential"
                                                        value="Residential"
                                                    />
                                                    <label className="form-check-label" htmlFor="Residential">
                                                        Residential
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                    <label htmlFor="servicesType" className="col-form-label col-12 mb-2 font-weight-bold">
                                                        <span>Commercial</span>
                                                    </label>
                                                <div className="form-check">

                                                    <div className='ChildBoxes row'>
                                                        <div className='col-md-6'>
                                                            <input
                                                                type="radio"
                                                                name="commercialType"
                                                                className="form-check-input"
                                                                required
                                                                id="Office"
                                                                value="Office"
                                                            />
                                                            <label className="form-check-label" htmlFor="Office">
                                                                Office
                                                            </label>
                                                        </div>
                                                        <div className='col-md-6'>
                                                            <input
                                                                type="radio"
                                                                name="commercialType"
                                                                className="form-check-input"
                                                                required
                                                                id="Hospitality"
                                                                value="Hospitality"
                                                            />
                                                            <label className="form-check-label" htmlFor="Hospitality">
                                                                Hospitality
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                            <label htmlFor="servicesType" className="col-form-label col-12 mb-2 font-weight-bold">
                                                        <span>Retail</span>
                                                    </label>
                                                <div className="form-check">
                                                   
                                                    <div className='ChildBoxes row'>
                                                        <div className='col-md-6'>
                                                            <input
                                                                type="radio"
                                                                name="retailType"
                                                                className="form-check-input"
                                                                required
                                                                id="Stores"
                                                                value="Stores"
                                                            />
                                                            <label className="form-check-label" htmlFor="Stores">
                                                                Stores
                                                            </label>
                                                        </div>
                                                        <div className='col-md-6'>
                                                            <input
                                                                type="radio"
                                                                name="retailType"
                                                                className="form-check-input"
                                                                required
                                                                id="Clinic"
                                                                value="Clinic"
                                                            />
                                                            <label className="form-check-label" htmlFor="Clinic">
                                                                Clinic
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Area and Width Section */}
                                        <div className="form-group row mb-4">
                                            <div className="col-md-6">
                                                <div className="form-check w-100">
                                                    <input
                                                        type="radio"
                                                        name="areaType"
                                                        className="form-check-input"
                                                        required
                                                        id="CarpetArea"
                                                        value="CarpetArea"
                                                    />
                                                    <label className="form-check-label ml-2" htmlFor="CarpetArea">
                                                        Carpet Area
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Your Area"
                                                        className="form-control mt-2"
                                                        required
                                                        id="areaInput"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-check w-100">
                                                    <input
                                                        type="radio"
                                                        name="budgetType"
                                                        className="form-check-input"
                                                        required
                                                        id="Budget"
                                                        value="Budget"
                                                    />
                                                    <label className="form-check-label ml-2" htmlFor="Budget">
                                                        Budget
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Your Width"
                                                        className="form-control mt-2"
                                                        required
                                                        id="widthInput"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="container">
                                            <a href={'/profile-details?page=interior'} className="buttons as_btn">Submit</a>
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}




        </div>
    );
}

export default Basic_details;

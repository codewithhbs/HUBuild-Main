

import { useEffect, useState } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { GetData } from "../../../utils/sessionStoreage"
import "./UpdateServices.css"

function UpdateServices() {
    const Data = GetData("user")
    const UserData = JSON.parse(Data)
    const UserId = UserData?._id

    const categories = ["Residential", "Commercial", "Landscape"]
    const [selectedCategory, setSelectedCategory] = useState("Residential")
    const [loading, setLoading] = useState(false)
    const [servicesData, setServicesData] = useState({
        Residential: {
            conceptDesignWithStructure: "",
            buildingServiceMEP: "",
            workingDrawing: "",
            interior3D: "",
            exterior3D: "",
            category: "Residential",
        },
        Commercial: {
            conceptDesignWithStructure: "",
            buildingServiceMEP: "",
            workingDrawing: "",
            interior3D: "",
            exterior3D: "",
            category: "Commercial",
        },
        Landscape: {
            conceptDesignWithStructure: "",
            buildingServiceMEP: "",
            workingDrawing: "",
            interior3D: "",
            exterior3D: "",
            category: "Landscape",
        },
    })

    const fetchServiceData = async (category) => {
        try {
            const { data } = await axios.get(
                `http://localhost:5000/api/v1/get-service-by-provider/${UserId}/${category}`,
            )

            const serviceData = data.data.find((service) => service.category === category)
            if (serviceData) {
                setServicesData((prev) => ({
                    ...prev,
                    [category]: {
                        ...prev[category],
                        ...serviceData,
                    },
                }))
            }
        } catch (error) {
            console.error(`Error fetching ${category} data:`, error)
        }
    }

    useEffect(() => {
        categories.forEach((category) => fetchServiceData(category))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleInputChange = (category, field, value) => {
        if (Number(value) < 0) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Input",
                text: "Value cannot be less than 0",
            });
            return;
        }
        setServicesData((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value,
            },
        }))
    }

    const handleSubmit = async (category) => {
        setLoading(true)
        try {
            await axios.put(
                `http://localhost:5000/api/v1/update-provider-service/${UserId}`,
                {
                    ...servicesData[category],
                    provider: UserId,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            )
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: `${category} services updated successfully!`,
            })
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: error?.response?.data?.message || "Failed to update service. Please try again.",
            })
        } finally {
            setLoading(false)
        }
    }

    const serviceFields = [
        { key: "conceptDesignWithStructure", label: "Concept Design" },
        { key: "buildingServiceMEP", label: "Building Service" },
        { key: "workingDrawing", label: "Working Drawing" },
        { key: "interior3D", label: "Interior 3D" },
        { key: "exterior3D", label: "Exterior 3D" },
    ]

    return (
        <div className="container-fluid mt-4">
            <div className="text-center  mb-4 p-3 as_btn_back text-white rounded-pill ">
                <h2 className="fw-bold ">Update Prices</h2>
            </div>

            <div className="row">
                {categories.map((category) => (
                    <div key={category} className="col-md-4 mb-4">
                        <div className="service-card">
                            <div className="form-check mb-3">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    id={`radio-${category}`}
                                    checked={selectedCategory === category}
                                    onChange={() => setSelectedCategory(category)}
                                />
                                <label className="form-check-label" htmlFor={`radio-${category}`}>
                                    {category}
                                </label>
                            </div>
                            <div className="service-inputs">
                                {serviceFields.map(({ key, label }) => (
                                    <div key={key} className="input-row">
                                        <label htmlFor="" className="form-label  ">
                                            {label} ₹/sq.ft.
                                        </label>

                                        <input
                                            type="number"
                                            className={`form-control ${selectedCategory !== category ? 'bg-light text-muted' : ''}`}
                                            placeholder={label}
                                            value={servicesData[category][key]}
                                            onChange={(e) => handleInputChange(category, key, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === '-' || e.key === 'e') e.preventDefault(); // prevent negative or exponential input
                                            }}
                                            readOnly={selectedCategory !== category}
                                            min="0"
                                        />


                                    </div>
                                ))}
                            </div>
                            <button className="btn as_btn w-100 mt-3 text-white" onClick={() => handleSubmit(category)} disabled={loading}>
                                {loading && category === selectedCategory ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UpdateServices


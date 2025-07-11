import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProviderDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const provider = location.state?.provider;

  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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
  });
  const [loadingServices, setLoadingServices] = useState(false);

  const categories = ["Residential", "Commercial", "Landscape"];

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [selectedImage]);

  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  // Reset zoom
  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Close modal
  const closeModal = () => {
    setSelectedImage(null);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  // Fetch service data for each category
  useEffect(() => {
    const fetchServicesData = async () => {
      if (!provider?.unique_id) return;

      setLoadingServices(true);
      try {
        const promises = categories.map(async (category) => {
          try {
            const { data } = await axios.get(
              `https://api.helpubuild.in/api/v1/get-service-by-provider/${provider._id}/${category}`
            );
            const serviceData = data.data.find((service) => service.category === category);
            if (serviceData) {
              setServicesData((prev) => ({
                ...prev,
                [category]: {
                  ...prev[category],
                  ...serviceData,
                },
              }));
            }
          } catch (error) {
            console.error(`Error fetching ${category} services:`, error);
          }
        });

        await Promise.all(promises);
      } catch (error) {
        console.error('Error fetching services data:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServicesData();
  }, [provider?.unique_id]);

  if (!provider) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">No provider details available</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price || price === "") return 'N/A';
    return `Rs. ${price}`;
  };

  const renderServiceCard = (category, services) => {
    const serviceLabels = {
      conceptDesignWithStructure: "Concept Design with Structure",
      buildingServiceMEP: "Building Service MEP",
      workingDrawing: "Working Drawing",
      interior3D: "Interior 3D",
      exterior3D: "Exterior 3D",
    };

    return (
      <div key={category} className="col-md-4 mb-4">
        <div className="card h-100">
          <div className="card-header bg-info text-white">
            <h6 className="mb-0">{category} Services</h6>
          </div>
          <div className="card-body">
            {loadingServices ? (
              <div className="text-center">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading services...</p>
              </div>
            ) : (
              <ul className="list-unstyled">
                {Object.entries(serviceLabels).map(([key, label]) => (
                  <li key={key} className="mb-2">
                    <small className="text-muted">{label}:</small>
                    <br />
                    <span className="fw-bold">{formatPrice(services[key])}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Provider Details</h3>
          <button className="btn btn-light" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        <div className="card-body">
          <div className="row">
            {/* Profile Section */}
            <div className="col-md-4 text-center mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <img
                    src={provider.photo?.imageUrl || 'https://via.placeholder.com/200'}
                    alt="Provider"
                    className="img-fluid rounded-circle mb-3"
                    style={{ width: '200px', height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setSelectedImage(provider.photo?.imageUrl || 'https://via.placeholder.com/200')}
                  />
                  <h4>{provider.name}</h4>
                  <p className="badge bg-success">{provider.type}</p>
                  <div className="mt-3">
                    <p className="mb-1">
                      <strong>Status:</strong>
                      <span
                        className={`badge ${
                          provider.accountVerified === 'Verified'
                            ? 'bg-success'
                            : provider.accountVerified === 'Rejected'
                            ? 'bg-danger'
                            : 'bg-warning'
                        } ms-2`}
                      >
                        {provider.accountVerified}
                      </span>
                    </p>
                    {provider.verificationRejectReason && (
                      <p className="text-danger small">
                        Reason: {provider.verificationRejectReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="col-md-8">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Basic Information</h5>
                      <ul className="list-unstyled">
                        <li><strong>Email:</strong> {provider.email}</li>
                        <li><strong>Phone:</strong> {provider.mobileNumber}</li>
                        <li><strong>Age:</strong> {provider.age || 'N/A'}</li>
                        <li><strong>DOB:</strong> {formatDate(provider.DOB)}</li>
                        <li><strong>Location:</strong> {provider.location?.formatted_address || `${provider.location?.city || ''}, ${provider.location?.state || ''} - ${provider.location?.pincode || ''}`}</li>
                        <li><strong>Experience:</strong> {provider.yearOfExperience} years</li>
                        <li><strong>COA Number:</strong> {provider.coaNumber || 'N/A'}</li>
                        <li><strong>Unique ID:</strong> {provider.unique_id || 'N/A'}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Professional Details</h5>
                      <ul className="list-unstyled">
                        <li><strong>Price/Min:</strong> Rs. {provider.pricePerMin}</li>
                        <li><strong>Wallet Amount:</strong> Rs. {provider.walletAmount}</li>
                        {provider.gstDetails && (
                          <li><strong>GST Details:</strong> {provider.gstDetails || 'N/A'}</li>
                        )}
                        <li><strong>Profile Complete:</strong> {provider.isProfileComplete ? 'Yes' : 'No'}</li>
                        <li><strong>Chat Status:</strong> {provider.chatStatus ? 'Available' : 'Unavailable'}</li>
                        <li><strong>Call Status:</strong> {provider.callStatus ? 'Available' : 'Unavailable'}</li>
                        <li><strong>Meet Status:</strong> {provider.meetStatus ? 'Available' : 'Unavailable'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Pricing Section */}
            <div className="col-12 mt-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Service Pricing</h5>
                  <div className="row">
                    {categories.map((category) => 
                      renderServiceCard(category, servicesData[category])
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="col-12 mt-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Documents</h5>
                  <div className="row g-3">
                    {/* Aadhaar */}
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-body">
                          <h6>Aadhaar Card</h6>
                          {provider.adhaarCard?.imageUrl ? (
                            <img
                              src={provider.adhaarCard.imageUrl}
                              alt="Aadhaar"
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px', objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => setSelectedImage(provider.adhaarCard.imageUrl)}
                            />
                          ) : (
                            <p className="text-muted">Not uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PAN */}
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-body">
                          <h6>PAN Card</h6>
                          {provider.panCard?.imageUrl ? (
                            <img
                              src={provider.panCard.imageUrl}
                              alt="PAN"
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px', objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => setSelectedImage(provider.panCard.imageUrl)}
                            />
                          ) : (
                            <p className="text-muted">Not uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Qualification */}
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-body">
                          <h6>Qualification Proof</h6>
                          {provider.qualificationProof?.imageUrl ? (
                            <img
                              src={provider.qualificationProof.imageUrl}
                              alt="Qualification"
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px', objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => setSelectedImage(provider.qualificationProof.imageUrl)}
                            />
                          ) : (
                            <p className="text-muted">Not uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery */}
            {provider.portfolio?.GalleryImages?.length > 0 && (
              <div className="col-12 mt-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Gallery</h5>
                    <div className="row g-3">
                      {provider.portfolio.GalleryImages.map((image, index) => (
                        <div key={index} className="col-md-4 col-lg-3">
                          <img
                            src={image.url}
                            alt={`Gallery ${index + 1}`}
                            className="img-fluid rounded"
                            style={{ width: '100%', height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setSelectedImage(image.url)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Link */}
            {provider.portfolio?.PortfolioLink?.url && (
              <div className="col-12 mt-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Portfolio</h5>
                    <a href={provider.portfolio.PortfolioLink.url} target="_blank" rel="noopener noreferrer">
                      View Portfolio
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Expertise & Languages */}
            <div className="col-12 mt-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Expertise & Languages</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Specializations:</h6>
                      {provider.expertiseSpecialization?.map((exp, i) => (
                        <span key={i} className="badge bg-info me-2 mb-2">{exp}</span>
                      ))}
                    </div>
                    <div className="col-md-6">
                      <h6>Languages:</h6>
                      {provider.language?.map((lang, i) => (
                        <span key={i} className="badge bg-secondary me-2 mb-2">{lang}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {provider.bio && (
              <div className="col-12 mt-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Bio</h5>
                    <p>{provider.bio}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Image Modal with Zoom */}
      {selectedImage && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.9)' }}
          tabIndex="-1"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content" style={{ backgroundColor: 'transparent', border: 'none' }}>
              {/* Zoom Controls */}
              <div className="position-fixed" style={{ top: '20px', right: '20px', zIndex: 1060 }}>
                <div className="btn-group-vertical bg-dark rounded p-2">
                  <button 
                    className="btn btn-sm btn-outline-light mb-2" 
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    title="Zoom In"
                  >
                    <i className="fas fa-plus"></i> +
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-light mb-2" 
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 0.5}
                    title="Zoom Out"
                  >
                    <i className="fas fa-minus"></i> -
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-light mb-2" 
                    onClick={handleResetZoom}
                    title="Reset Zoom"
                  >
                    <i className="fas fa-expand-arrows-alt"></i>
                  </button>
                  <div className="text-light small text-center">
                    {Math.round(zoomLevel * 100)}%
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="position-fixed" style={{ top: '20px', left: '20px', zIndex: 1060 }}>
                <button 
                  className="btn btn-outline-light btn-sm" 
                  onClick={closeModal}
                  title="Close"
                >
                  <i className="fas fa-times"></i> Close
                </button>
              </div>

              {/* Image Container */}
              <div 
                className="modal-body text-center p-0 d-flex justify-content-center align-items-center"
                style={{ 
                  height: '100vh', 
                  overflow: 'hidden',
                  cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              >
                <img
                  src={selectedImage}
                  alt="Zoomed Preview"
                  style={{
                    maxHeight: zoomLevel === 1 ? '90vh' : 'none',
                    maxWidth: zoomLevel === 1 ? '90vw' : 'none',
                    transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                  onMouseDown={handleMouseDown}
                  draggable={false}
                />
              </div>

              {/* Instructions */}
              <div className="position-fixed" style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1060 }}>
                <div className="bg-dark text-light rounded px-3 py-2 small">
                  <i className="fas fa-info-circle me-2"></i>
                  Use mouse wheel to zoom • Drag to pan when zoomed • Click outside to close
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProviderDetails;
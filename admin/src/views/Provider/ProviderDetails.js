import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ProviderDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const provider = location.state?.provider;

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

  return (
    <div className="container-fluid py-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Provider Details</h3>
          <button
            className="btn btn-light"
            onClick={() => navigate(-1)}
          >
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
                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                  />
                  <h4>{provider.name}</h4>
                  <p className="badge bg-success">{provider.type}</p>
                  <div className="mt-3">
                    <p className="mb-1"><strong>Status:</strong>
                      <span className={`badge ${provider.accountVerified === 'Verified' ? 'bg-success' :
                        provider.accountVerified === 'Rejected' ? 'bg-danger' : 'bg-warning'} ms-2`}>
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

            {/* Basic Information */}
            <div className="col-md-8">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Basic Information</h5>
                      <ul className="list-unstyled">
                        <li><strong>Email:</strong> {provider.email}</li>
                        <li><strong>Phone:</strong> {provider.mobileNumber}</li>
                        <li><strong>Age:</strong> {provider.age}</li>
                        <li><strong>DOB:</strong> {formatDate(provider.DOB)}</li>
                        <li>
                          <strong>Location:</strong>{" "}
                          {provider.location?.formatted_address ||
                            `${provider.location?.city || ''}, ${provider.location?.state || ''} - ${provider.location?.pincode || ''}`}
                        </li>

                        <li><strong>Experience:</strong> {provider.yearOfExperience} years</li>
                        <li><strong>COA Number:</strong> {provider.coaNumber || 'N/A'}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Professional Details</h5>
                      <ul className="list-unstyled">
                        <li><strong>Rating:</strong> {provider.averageRating || 'N/A'}</li>
                        <li><strong>Price/Min:</strong> Rs. {provider.pricePerMin}</li>
                        <li><strong>Wallet Amount:</strong> Rs. {provider.walletAmount}</li>
                        <li><strong>GST Details:</strong> {provider.gstDetails || 'N/A'}</li>
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

            {/* Documents Section */}
            <div className="col-12 mt-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Documents</h5>
                  <div className="row g-3">
                    {/* Aadhaar Card */}
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-subtitle mb-2">Aadhaar Card</h6>
                          {provider.adhaarCard?.imageUrl ? (
                            <img
                              src={provider.adhaarCard.imageUrl}
                              alt="Aadhaar Card"
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px', objectFit: 'cover' }}
                            />
                          ) : (
                            <p className="text-muted">Not uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PAN Card */}
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-subtitle mb-2">PAN Card</h6>
                          {provider.panCard?.imageUrl ? (
                            <img
                              src={provider.panCard.imageUrl}
                              alt="PAN Card"
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px', objectFit: 'cover' }}
                            />
                          ) : (
                            <p className="text-muted">Not uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Qualification Proof */}
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-subtitle mb-2">Qualification Proof</h6>
                          {provider.qualificationProof?.imageUrl ? (
                            <img
                              src={provider.qualificationProof.imageUrl}
                              alt="Qualification Proof"
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px', objectFit: 'cover' }}
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

            {/* Gallery Section */}
            {provider.gallery && provider.gallery.length > 0 && (
              <div className="col-12 mt-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Gallery</h5>
                    <div className="row g-3">
                      {provider.gallery.map((image, index) => (
                        <div key={index} className="col-md-4 col-lg-3">
                          <img
                            src={image.imageUrl}
                            alt={`Gallery ${index + 1}`}
                            className="img-fluid rounded"
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details Section */}
            {provider.bankDetail && (
              <div className="col-12 mt-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Bank Details</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <ul className="list-unstyled">
                          <li><strong>Account Holder:</strong> {provider.bankDetail.accountHolderName}</li>
                          <li><strong>Bank Name:</strong> {provider.bankDetail.bankName}</li>
                          <li><strong>Branch:</strong> {provider.bankDetail.branchName}</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="list-unstyled">
                          <li><strong>Account Number:</strong> {provider.bankDetail.accountNumber}</li>
                          <li><strong>IFSC Code:</strong> {provider.bankDetail.ifscCode}</li>
                          <li><strong>PAN Number:</strong> {provider.bankDetail.panCardNumber}</li>
                        </ul>
                      </div>
                    </div>
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
                      <div className="mb-3">
                        {provider.expertiseSpecialization?.map((exp, index) => (
                          <span key={index} className="badge bg-info me-2 mb-2">{exp}</span>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6>Languages:</h6>
                      <div>
                        {provider.language?.map((lang, index) => (
                          <span key={index} className="badge bg-secondary me-2 mb-2">{lang}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Section */}
            {provider.service && provider.service.length > 0 && (
              <div className="col-12 mt-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Services</h5>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Service Name</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {provider.service.map((service, index) => (
                            <tr key={index}>
                              <td>{service.name}</td>
                              <td>Rs. {service.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bio Section */}
            {provider.bio && (
              <div className="col-12 mt-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Bio</h5>
                    <p className="mb-0">{provider.bio}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderDetails;
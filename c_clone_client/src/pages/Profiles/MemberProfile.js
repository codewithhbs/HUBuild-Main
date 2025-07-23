import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
function MemberProfile() {
  const { id } = useParams();  // Get the 'id' from the URL params
  const [loading, setLoading] = useState(false);

  // Initialize memberData state with all fields
  const [memberData, setMemberData] = useState({
    email: '',
    age: '',
    gender: '',
    nationality: '',
    occupation: '',
    education: '',
    experience: '',
    bio: '',
    language: [],
    AddharImage: null,
    PanCardImage: null,
    Expertise: '',
    QualificationImage: null,
    Location: '',
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData({
      ...memberData,
      [name]: value
    });
  };

  // Handle file input changes (for image uploads)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setMemberData({
      ...memberData,
      [name]: files[0]
    });
  };
  const languageOptions = [
    { value: 'Hindi', label: 'Hindi' },
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Korean', label: 'Korean' },
    { value: 'Turkish', label: 'Turkish' },
    { value: 'Polish', label: 'Polish' },
    { value: 'Dutch', label: 'Dutch' },
    { value: 'Swedish', label: 'Swedish' },
    { value: 'Danish', label: 'Danish' },
    { value: 'Norwegian', label: 'Norwegian' },
    { value: 'Finnish', label: 'Finnish' },
    { value: 'Greek', label: 'Greek' },
    { value: 'Hebrew', label: 'Hebrew' },

  ];
  const handleLanguageChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setMemberData({
      ...memberData,
      language: selectedValues,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setLoading(false);
  };

  return (
    <>
      <section className="py-5">
        <div className="container">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-lg-12 col-xl-11">
              <div className="card text-black" style={{ borderRadius: 25 }}>
                <div className="card-body register-bg p-md-5">
                  <div className="row justify-content-center">
                    <div className="col-lg-12 col-xl-12 col-md-10 order-2 order-lg-1">
                      <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4 text-white">
                        Partner Registration Form
                      </p>
                      <form onSubmit={handleSubmit} className="mx-3 mx-md-5 my-4">
                        <div className="row">
                          {/* Email */}
                          <div className="col-md-6">
                            <label htmlFor="email" className="form-label text-white">Email</label>
                            <input
                              type="email"
                              className="form-control border"
                              id="email"
                              name="email"
                              value={memberData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          {/* Age */}
                          <div className="col-md-6">
                            <label htmlFor="age" className="form-label text-white">Age</label>
                            <input
                              type="number"
                              className="form-control border"
                              id="age"
                              name="age"
                              value={memberData.age}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          {/* Gender */}
                          <div className="col-md-6">
                            <label htmlFor="gender" className="form-label text-white">Gender</label>
                            <select
                              className="form-control border"
                              id="gender"
                              name="gender"
                              value={memberData.gender}
                              onChange={handleChange}
                              required
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {/* Nationality */}
                          <div className="col-md-6">
                            <label htmlFor="nationality" className="form-label text-white">Nationality</label>
                            <input
                              type="text"
                              className="form-control border"
                              id="nationality"
                              name="nationality"
                              value={memberData.nationality}
                              onChange={handleChange}
                              required
                            />
                          </div>

                       
                          <div className="col-md-6">
                            <label htmlFor="occupation" className="form-label text-white">Occupation</label>
                            <input
                              type="text"
                              className="form-control border"
                              id="occupation"
                              name="occupation"
                              value={memberData.occupation}
                              onChange={handleChange}
                              required
                            />
                          </div>

                   
                          <div className="col-md-6">
                            <label htmlFor="language" className="form-label text-white">Languages</label>
                            <Select
                              isMulti
                              name="language"
                              id="language"
                              options={languageOptions}
                              value={languageOptions.filter(option => memberData.language.includes(option.value))}
                              onChange={handleLanguageChange}

                              placeholder="Select languages"
                            />
                          </div>

             
                          <div className="col-md-6">
                            <label htmlFor="education" className="form-label text-white">Education</label>
                            <input
                              type="text"
                              className="form-control border"
                              id="education"
                              name="education"
                              value={memberData.education}
                              onChange={handleChange}
                              required
                            />
                          </div>

             
                          <div className="col-md-6">
                            <label htmlFor="experience" className="form-label text-white">Experience</label>
                            <input
                              type="text"
                              className="form-control border"
                              id="experience"
                              name="experience"
                              value={memberData.experience}
                              onChange={handleChange}
                              required
                            />
                          </div>

               
                          <div className="col-md-6">
                            <label htmlFor="expertise" className="form-label text-white">Expertise</label>
                            <input
                              type="text"
                              className="form-control border"
                              id="expertise"
                              name="Expertise"
                              value={memberData.Expertise}
                              onChange={handleChange}
                              required
                            />
                          </div>

                   
                          <div className="col-md-6">
                            <label htmlFor="location" className="form-label text-white">Location</label>
                            <input
                              type="text"
                              className="form-control border"
                              id="location"
                              name="Location"
                              value={memberData.Location}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="col-md-6">
                            <label htmlFor="addharImage" className="form-label text-white">Aadhar Image</label>
                            <input
                              type="file"
                              className="form-control custom-file-input"
                              id="addharImage"
                              name="AddharImage"
                              onChange={handleFileChange}
                            />
                            <small className="form-text ">Please upload a clear image of your Aadhar card.</small>
                          </div>

                          <div className="col-md-6">
                            <label htmlFor="panCardImage" className="form-label text-white">Pan Card Image</label>
                            <input
                              type="file"
                              className="form-control custom-file-input"
                              id="panCardImage"
                              name="PanCardImage"
                              onChange={handleFileChange}
                            />
                            <small className="form-text ">Please upload a clear image of your PAN card.</small>
                          </div>

                    
                          <div className="col-md-6">
                            <label htmlFor="qualificationImage" className="form-label text-white">Qualification Image</label>
                            <input
                              type="file"
                              className="form-control custom-file-input"
                              id="qualificationImage"
                              name="QualificationImage"
                              onChange={handleFileChange}
                            />
                            <small className="form-text ">Please upload a scanned copy of your qualification certificate.</small>
                          </div>

                        </div>
                        <div className="col-md-12">
                          <label htmlFor="bio" className="form-label text-white">Bio</label>
                          <textarea
                            className="form-control border"
                            id="bio"
                            name="bio"
                            value={memberData.bio}
                            onChange={handleChange}
                            rows="4"
                            required
                          />
                        </div>
                        {/* Submit Button */}
                        <div className="d-flex justify-content-center mt-4">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                          >
                            {loading ? (
                              <span>
                                Please wait
                                <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                              </span>
                            ) : (
                              "Register"
                            )}
                          </button>
                        </div>
                      </form>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default MemberProfile;

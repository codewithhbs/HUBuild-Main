import axios from 'axios';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2';
const UploadGallery = ({ isShow, token }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        maxSize: 10 * 1024 * 1024, // 10MB max size per file
        onDrop: (acceptedFiles) => setFiles(acceptedFiles),
    });

    const handleUpload = async () => {
        const formData = new FormData();
        files.forEach((file) => formData.append('GalleryImages', file));

        setUploading(true);

        try {
            await axios.post('https://testapi.dessobuild.com/api/v1/addPortfolio?type=Gallery', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },

            });
            // toast.success("Successfully uploaded Gallery Images")
            Swal.fire({
                title: 'Success!',
                text: "Successfully uploaded Gallery Images",
                icon: 'success', // use lowercase
                confirmButtonText: 'Okay'
            });
            window.location.reload()

            // console.log('Upload success:', response.data);
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };
    return (
        <div>
            <div className="text-end mt-4">

                <button
                    onClick={handleUpload}
                    className="btn mb-3 btn-outline-danger btn-lg"
                    disabled={uploading || files.length === 0}
                >
                    <i className="fas fa-upload me-2"></i>
                    {uploading ? 'Uploading...' : 'Upload Gallery '}
                </button>
            </div>

            {/* Upload Area (Dropzone) */}
            <div
                {...getRootProps()}
                className="dropzone text-center border-3 border-primary p-5 rounded-lg shadow-lg transition-all hover:shadow-xl hover:bg-gray-100"
                style={{
                    background: '#f7f7f7',
                    cursor: 'pointer',
                }}
            >
                <input {...getInputProps()} />
                <h5 className="text-muted mb-3">
                    Drag & drop your Images here, or click to select files
                </h5>
                <p className="text-muted mb-4">Max file size: 10MB</p>
                <i className="fas fa-cloud-upload-alt text-primary fa-4x mb-3" />
                <p className="text-muted">Only image files are allowed</p>
            </div>

            {/* Display selected files */}
            <div className="mt-4">
                {files.length > 0 && (
                    <div className="row">
                        {files.map((file, index) => (
                            <div key={index} className="col-12 col-md-4 mb-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body text-center">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="img-fluid rounded mb-2"
                                            style={{ maxHeight: '150px', objectFit: 'cover' }}
                                        />
                                        <p className="card-text">{file.name}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadGallery;

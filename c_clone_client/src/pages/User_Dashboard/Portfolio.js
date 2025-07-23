import React from 'react';

const Portfolio = ({ fileUrl }) => {
    console.log(fileUrl);
    return (
        <div>
            <h2>Portfolio</h2>
            {fileUrl ? (
                <iframe
                    src={`https://docs.google.com/gview?url=${fileUrl.url}&embedded=true`}
                    width="100%"
                    height="700px"
                    title="Portfolio PDF"
                    style={{ border: 'none' }}
                />
            ) : (
                <p>No PDF available</p>
            )}
        </div>
    );
};

export default Portfolio;

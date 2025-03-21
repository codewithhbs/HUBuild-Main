import React, { useEffect, useState } from 'react';

function FailedPayment() {
  const [paymentDetails, setPaymentDetails] = useState({
    error: '',
    amount: '',
    transactionId: '',
    date: '',
  });

  useEffect(() => {
    // Extract query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);

    // Set state with values from the URL
    setPaymentDetails({
      error: urlParams.get('error'),
      amount: urlParams.get('amount'),
      transactionId: urlParams.get('transactionId'),
      date: urlParams.get('date'),
    });
  }, []);

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 rounded-3 p-4">
            <div className="card-body text-center">
              <div className="mb-4">
                <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
              </div>
              <h2 className="text-danger mb-3">Payment Failed!</h2>
              <p className="text-muted">{paymentDetails.error || 'There was an issue processing your payment. Please try again.'}</p>

              <div className="my-4">
                <h5>Payment Details</h5>
                <ul className="list-unstyled">
                  <li><strong>Amount:</strong> ₹{(paymentDetails.amount / (paymentDetails.amount >= 100 ? 100 : 1)).toFixed(2)}</li>
                  <li><strong>Transaction ID:</strong> {paymentDetails.transactionId}</li>
                  <li><strong>Date:</strong> {new Date(paymentDetails.date).toLocaleString()}</li>
                </ul>
              </div>

              <div className="mt-4">
                <a href="/" className="btn btn-danger btn-lg text-white">Go to Home Page</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Icons CDN */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
        rel="stylesheet"
      />
    </div>
  );
}

export default FailedPayment;

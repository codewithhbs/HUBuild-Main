import React, { useEffect, useState } from 'react';

function SuccessFull() {
  const [rechargeDetails, setRechargeDetails] = useState({
    amount: '',
    transactionId: '',
    date: '',
  });

  useEffect(() => {
    // Extract query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);

    // Update state with the extracted values
    setRechargeDetails({
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
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
              </div>
              <h2 className="text-success mb-3">Payment Successful!</h2>
              <p className="text-muted">Your recharge has been processed successfully. Thank you for using our service!</p>
              
              <div className="my-4">
                <h5>Recharge Details</h5>
                <ul className="list-unstyled">
                <li><strong>Amount Recharged:</strong> ₹{(rechargeDetails.amount / (rechargeDetails.amount >= 100 ? 100 : 1)).toFixed(2)}</li>
                  <li><strong>Transaction ID:</strong> {rechargeDetails.transactionId}</li>
                  <li><strong>Date:</strong> {new Date(rechargeDetails.date).toLocaleString()}</li>
                </ul>
              </div>

              <div className="mt-4">
                <a href="/" className="btn btn-primary btn-lg text-white">Go to Home Page</a>
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

export default SuccessFull;

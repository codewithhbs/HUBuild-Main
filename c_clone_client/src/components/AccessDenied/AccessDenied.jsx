import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function AccessDenied() {
  return (
    <div style={{height:'80vh'}} className="container text-center d-flex flex-column align-items-center justify-content-center">
      <h2>Access Denied</h2>
      <p>You need to log in to access the chat page.</p>
      <Link to="/login">
        <button className="btn btn-primary">Go to Login Page</button>
      </Link>
    </div>
  )
}

export default AccessDenied

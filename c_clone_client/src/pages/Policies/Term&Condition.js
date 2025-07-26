import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const TermCondition = () => {
  const location = useLocation();
  const [term, setTerm] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const termType = searchParams.get('type');

  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const { data } = await axios.get(`https://www.testapi.helpubuild.in/api/v1/single_term/${termType}`);
        setTerm(data?.data);
        window.scrollTo(0, 0); // Scroll to top when termType changes
      } catch (error) {
        console.error('Error fetching term:', error.message);
      }
    };

    if (termType) {
      fetchTerm();
    }
  }, [termType]);

  return (
    <div className="container mt-5 mb-5">
      {term ? (
        <div dangerouslySetInnerHTML={{ __html: term.text }}></div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TermCondition;

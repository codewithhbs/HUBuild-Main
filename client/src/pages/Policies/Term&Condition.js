import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';

const TermCondition = () => {
  const [term, setTerm] = useState({})
  const id = '67f8bb6f160226ea5b6a957f'
  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/single_term/${id}`)
        setTerm(data.data)
      } catch (error) {
        console.log("Internal server error", error)
      }
    }
    fetchTerm();
  }, [])
  return (
    <>

      <div className="container mt-5 mb-5">
        <div dangerouslySetInnerHTML={{ __html: term?.text }}></div>
      </div>
    </>
  );
};

export default TermCondition;
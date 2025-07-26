import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import JoditEditor from 'jodit-react';

const ERefund = () => {
  const [text, setText] = useState('');
  const [typse, setType] = useState('');
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(false);
  const editor = useRef(null);

  const getTypeFromHash = () => {
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    return new URLSearchParams(queryString).get('type');
  };

  // Use useMemo to get type and trigger re-render when hash changes
  const type = useMemo(() => getTypeFromHash(), [window.location.hash]);

  // Fetch term data
  const fetchTerm = async (termType) => {
    if (!termType) return;

    setLoading(true);
    try {
      const { data } = await axios.get(`https://www.testapi.helpubuild.in/api/v1/single_term/${termType}`);
      setText(data?.data?.text || '');
      setType(data?.data?.type || '');
      setId(data?.data?._id || null);
    } catch (error) {
      console.error('Error fetching term:', error);
      toast.error('Failed to fetch term. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Listen for hash changes to reload data
  useEffect(() => {
    const handleHashChange = () => {
      const newType = getTypeFromHash();
      if (newType) {
        fetchTerm(newType);
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Initial load
    const currentType = getTypeFromHash();
    if (currentType) {
      fetchTerm(currentType);
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [type]);

  // Jodit editor configuration
  const config = useMemo(
    () => ({
      readonly: false,
      height: 400,
      placeholder: 'Start typing...',
    }),
    []
  );

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      toast.error('No term ID found. Please refresh and try again.');
      return;
    }

    // Get the current content from the editor
    const currentText = editor.current?.value || text;

    if (!currentText.trim()) {
      toast.error('Please enter some content.');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`https://www.testapi.helpubuild.in/api/v1/update_term/${id}`, {
        text: currentText,
        type: typse
      });
      toast.success('Updated Successfully!');
    } catch (error) {
      console.error('Error updating term:', error);
      toast.error('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle editor content change
  const handleEditorChange = (newContent) => {
    setText(newContent);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Edit Term: <span className="text-blue-600">Cancellation and refund</span>
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <JoditEditor
            ref={editor}
            value={text}
            config={config}
            tabIndex={1}
            onBlur={handleEditorChange}
            onChange={handleEditorChange}
          />
        </div>

        <button
  type="submit"
  disabled={loading || !id}
  className={`mt-4 btn btn-lg d-flex align-items-center gap-2 ${
    loading || !id ? 'btn-secondary disabled' : 'btn-primary'
  }`}
>
  {loading ? (
    <>
      <span
        className="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
      Updating...
    </>
  ) : (
    <>
      <i className="bi bi-save"></i> {/* Bootstrap Icons (optional) */}
      Update Term
    </>
  )}
</button>
      </form>
    </div>
  );
};

export default ERefund;

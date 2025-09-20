import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CWidgetStatsF,
  CSpinner,
} from '@coreui/react';
import { CChart } from '@coreui/react-chartjs';
import {
  cilPeople,
  cilUserFollow,
  cilMoney,
  cilWallet,
  cilBank,
  cilChatBubble
} from '@coreui/icons';
// import cilChat from '@coreui/icons/js/free/cil-chat';
import CIcon from '@coreui/icons-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const token = sessionStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [allUserCount, setAllUserCount] = useState(0);
  const [allProviderCount, setAllProviderCount] = useState({
    Vastu: 0,
    Architect: 0,
    Interior: 0
  });
  const [allChatCount, setAllChatCount] = useState(0);
  const [allRecharge, setAllRecharge] = useState(0);
  const [allWithdraw, setAllWithdraw] = useState({
    request: 0,
    commission: 0
  });

  const handleFetchUser = async () => {
    try {
      const { data } = await axios.get('https://api.dessobuild.com/api/v1/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAllUserCount(data.data.length);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch users');
    }
  };

  const fetchProviders = async () => {
    try {
      const { data } = await axios.get('https://api.dessobuild.com/api/v1/get-all-provider');
      const allData = data.data;
      setAllProviderCount({
        Vastu: allData.filter(provider => provider.type === 'Vastu').length,
        Architect: allData.filter(provider => provider.type === 'Architect').length,
        Interior: allData.filter(provider => provider.type === 'Interior').length
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch providers');
    }
  };

  const handleFetchChat = async () => {
    try {
      const { data } = await axios.get('https://api.dessobuild.com/api/v1/get-all-chat-record');
      setAllChatCount(data.data.length);
    } catch (error) {
      toast.error('Failed to load chat records');
    }
  };

  const handleFetchRecharge = async () => {
    try {
      const { data } = await axios.get('https://api.dessobuild.com/api/v1/total-recharge-amount');
      setAllRecharge(data.data);
    } catch (error) {
      toast.error('Failed to load recharge amount');
    }
  };

  const handleFetchWithdraw = async () => {
    try {
      const { data } = await axios.get('https://api.dessobuild.com/api/v1/total-withdraw-and-commission');
      setAllWithdraw({
        request: data.totalWithdrawAmount,
        commission: data.totalCommission
      });
    } catch (error) {
      // toast.error('Failed to load withdraw data');
      console.log("Failed to load withdraw data", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      handleFetchUser(),
      fetchProviders(),
      handleFetchChat(),
      handleFetchRecharge(),
      handleFetchWithdraw()
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  const providerData = {
    labels: ['Vastu', 'Architect', 'Interior'],
    datasets: [
      {
        data: [
          allProviderCount.Vastu,
          allProviderCount.Architect,
          allProviderCount.Interior
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }
    ]
  };

  const financialData = {
    labels: ['Recharge', 'Withdrawals', 'Commission'],
    datasets: [
      {
        label: 'Amount (₹)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
        data: [allRecharge, allWithdraw.request, allWithdraw.commission]
      }
    ]
  };

  return (
    <>
      <CRow>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilPeople} height={24} />}
            title="Total Users"
            value={allUserCount}
            color="primary"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilUserFollow} height={24} />}
            title="Total Providers"
            value={Object.values(allProviderCount).reduce((a, b) => a + b, 0)}
            color="info"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilChatBubble} height={24} />}
            title="Total Chats"
            value={allChatCount}
            color="warning"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilMoney} height={24} />}
            title="Total Recharge"
            value={`₹${allRecharge.toLocaleString()}`}
            color="success"
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h4 className="card-title mb-4">Provider Distribution</h4>
              <CChart
                type="doughnut"
                data={providerData}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  },
                  cutout: '60%'
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h4 className="card-title mb-4">Financial Overview</h4>
              <CChart
                type="bar"
                data={financialData}
                options={{
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol sm={6}>
          <CCard className="mb-4">
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title mb-1">Total Withdrawals</h4>
                  <div className="fs-6 fw-semibold text-primary">
                    ₹{allWithdraw.request.toLocaleString()}
                  </div>
                </div>
                <CIcon icon={cilWallet} height={48} className="text-black-50" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6}>
          <CCard className="mb-4">
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title mb-1">Total Commission</h4>
                  <div className="fs-6 fw-semibold text-success">
                    ₹{allWithdraw.commission.toLocaleString()}
                  </div>
                </div>
                <CIcon icon={cilBank} height={48} className="text-black-50" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default Dashboard;

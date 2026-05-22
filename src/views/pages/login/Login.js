import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CImage,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import { logo } from '../../../assets/brand/logo';
import { useDispatch, useSelector } from 'react-redux';
import './Login.css';
import { API_BASE } from '../../../api/base';

const Login = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [redirectPath, setRedirectPath] = useState(null); 
  
  useEffect(() => {
    const accessToken = user.accessToken;
    if (accessToken) {
      const verifyToken = async () => {
        try {
          const response = await fetch(`${API_BASE}/verify-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': accessToken
            }
          });

          if (response.ok) {
            const decodedToken = jwtDecode(accessToken);
            setRedirectPath('/dashboard');
          } else {
            toast.error('Invalid or Expiry Token');
            dispatch({ type: 'clearUser' });
          }
        } catch (error) {
          toast.error('Unknown Error. Try Again Later');
        }
      };
      verifyToken();
    }
  }, [dispatch, user.accessToken]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData, 
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        const decodedAccessToken = jwtDecode(data.accessToken);
        const userRole = decodedAccessToken.roles[0];
        dispatch({ 
          type: 'setUser', 
          role: userRole,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        });

        dispatch({ type: 'Voted' });
        setRedirectPath('/dashboard');
      } else {
        toast.error(`Login failed. ${data.message}`);
      }
    } catch (err) {
      console.error("Error: ", err);
      toast.error("Login failed. Please try again.");
    }
  };

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <>
      <CImage
        customClassName="sidebar-brand-full"
        src={logo}
        height={80}
        className='mb-1 mt-1'
      />
      <div className="bg-body-tertiary d-flex flex-row align-items-center " >
        <CContainer >
          <CRow className="justify-content-center">
            <CCol md={14}>
              <CCardGroup >
             


              <div style={{ height: '280px', width: '100%' }}>
                <iframe 
                  title="Bull | 3D Sculpting"
                  frameBorder="0" 
                  allowFullScreen 
                  mozallowfullscreen="true" 
                  webkitallowfullscreen="true" 
                  allow="autoplay; fullscreen; xr-spatial-tracking" 
                  xr-spatial-tracking 
                  execution-while-out-of-viewport 
                  execution-while-not-rendered 
                  web-share 
                  src="https://sketchfab.com/models/72c8db8d9e8b40d6883031d3bda43fa7/embed?autostart=1&transparent=1&ui_controls=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0"
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
              <CCard className="text-white py-5 bounce" style={{ width: '44%', backgroundColor: 'black' }}>
                  <CCardBody className="text-center">
                    <div>
                      <h1 className='text-center'>vision</h1> 
                      <p>
                      Is to "Become a home of distinctive financial solutions and service excellence"
                      </p>
                    </div>
                  </CCardBody>
                </CCard>
                <CCard className="p-4">
                  <CCardBody>
                    <CForm onSubmit={handleSubmit}>
                      <h1 className='text-center'>Login</h1>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Email"
                          name="email"
                          id="email"
                          type="text"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </CInputGroup>

                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          name="password"
                          id="password"
                          placeholder="Password"
                          autoComplete="current-password"
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                        />
                      </CInputGroup>

                      <CRow>
                        <CCol xs={6}>
                          <CButton
                            type='submit'
                            color="primary"
                            className="px-4"
                            style={{
                              backgroundImage: 'linear-gradient(to right, black 50%, red 50%)',
                              width: '218%',
                              border: 'none' 
                            }}
                          >
                            Login
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>
                <CCard className="text-white py-5 bounce" style={{ width: '44%', backgroundColor: 'red' }}>
                  <CCardBody className="text-center">
                    <div>
                      <h1 className='text-center'>Mission</h1> 
                      <p>To deliver unique financial experience, engaging work environment and sustainable value for all 
                        our stakeholders using empowered workforce and technology, in a socially responsible manner.
                      </p>
                    </div>
                  </CCardBody>
                </CCard>
              </CCardGroup>
            </CCol>
          </CRow>
        </CContainer>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default Login;



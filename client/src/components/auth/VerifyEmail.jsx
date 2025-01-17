import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const [status, setStatus] = useState('verifying');
    const { token } = useParams();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(`http://localhost:5005/api/auth/verify-email/${token}`);
                if (response.status === 200) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (err) {
                // If user is already verified, we'll still show success
                if (err.response?.status === 400 && err.response?.data?.message?.includes('already verified')) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="text-3xl font-bold text-center">Email Verification</h2>

                {status === 'verifying' && (
                    <div className="text-center text-gray-600">
                        Verifying your email...
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <div className="bg-green-50 text-green-500 p-3 rounded text-center">
                            Your email has been verified successfully!
                        </div>
                        <div className="text-center">
                            <Link
                                to="/login"
                                className="text-[#6D70E0] hover:underline"
                            >
                                Proceed to Login
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="bg-red-50 text-red-500 p-3 rounded text-center">
                            Failed to verify email. The link may be invalid or expired.
                        </div>
                        <div className="text-center">
                            <Link
                                to="/login"
                                className="text-[#6D70E0] hover:underline"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
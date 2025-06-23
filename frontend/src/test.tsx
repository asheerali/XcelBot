import React, { useState, useEffect } from 'react';

interface DebugInfo {
    timestamp: string;
    screenSize: string;
    userAgent: string;
}

const DebugPage: React.FC = () => {
    const [debugInfo, setDebugInfo] = useState<DebugInfo>({
        timestamp: new Date().toISOString(),
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
    });
    
    const [counter, setCounter] = useState<number>(0);
    const [isVisible, setIsVisible] = useState<boolean>(true);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setDebugInfo({
                timestamp: new Date().toISOString(),
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                userAgent: navigator.userAgent,
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>Debug Page</h1>
            
            <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
                <h2>System Info</h2>
                <p><strong>Time:</strong> {debugInfo.timestamp}</p>
                <p><strong>Screen Size:</strong> {debugInfo.screenSize}</p>
                <p><strong>User Agent:</strong> {debugInfo.userAgent}</p>
            </div>
            
            <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
                <h2>Interactive Elements</h2>
                <div>
                    <p>Counter: {counter}</p>
                    <button onClick={() => setCounter(counter + 1)} style={{ margin: '5px' }}>Increment</button>
                    <button onClick={() => setCounter(0)} style={{ margin: '5px' }}>Reset</button>
                </div>
                
                <div style={{ marginTop: '15px' }}>
                    <button onClick={() => setIsVisible(!isVisible)} style={{ margin: '5px' }}>
                        {isVisible ? 'Hide' : 'Show'} Content
                    </button>
                    {isVisible && (
                        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd' }}>
                            This is toggleable content for debugging visibility.
                        </div>
                    )}
                </div>
            </div>
            
            <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
                <h2>Local Storage</h2>
                <button 
                    onClick={() => localStorage.setItem('debugTimestamp', new Date().toISOString())}
                    style={{ margin: '5px' }}
                >
                    Set Timestamp
                </button>
                <button 
                    onClick={() => alert(localStorage.getItem('debugTimestamp') || 'No timestamp set')}
                    style={{ margin: '5px' }}
                >
                    Get Timestamp
                </button>
                <button 
                    onClick={() => localStorage.removeItem('debugTimestamp')}
                    style={{ margin: '5px' }}
                >
                    Clear Timestampp
                </button>
            </div>
        </div>
    );
};

export default DebugPage;</div>
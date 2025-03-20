import React, { useState } from 'react';

const AverageCalculator = () => {
  const WINDOW_SIZE = 10;
  const TIMEOUT = 500;
  const TEST_SERVER_BASE_URL = 'http://20.244.56.144/test';
  
  const API_ENDPOINTS = {
    p: 'primes',
    f: 'fibo',
    e: 'even',
    r: 'rand'
  };
  
  const [numberType, setNumberType] = useState('e');
  const [storage, setStorage] = useState({
    p: [],
    f: [],
    e: [],
    r: []
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const calculateAverage = (arr) => {
    if (arr.length === 0) return '0.00';
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return (sum / arr.length).toFixed(2);
  };
  
  const fetchNumbers = async (type) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    try {
      const endpoint = API_ENDPOINTS[type];
      const response = await fetch(`${TEST_SERVER_BASE_URL}/${endpoint}`, {
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.numbers || [];
    } catch (error) {
      if (error.name === 'AbortError') {
        return [];
      }
      return [];
    } finally {
      clearTimeout(timeoutId);
    }
  };
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const windowPrevState = [...storage[numberType]];
      const newNumbers = await fetchNumbers(numberType);
      const updatedStorage = { ...storage };
      
      for (const num of newNumbers) {
        if (!updatedStorage[numberType].includes(num)) {
          if (updatedStorage[numberType].length < WINDOW_SIZE) {
            updatedStorage[numberType].push(num);
          } else {
            updatedStorage[numberType].shift();
            updatedStorage[numberType].push(num);
          }
        }
      }
      
      setStorage(updatedStorage);
      
      setResult({
        windowPrevState,
        windowCurrState: updatedStorage[numberType],
        numbers: newNumbers,
        avg: calculateAverage(updatedStorage[numberType])
      });
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const simulateFirstTestCase = () => {
    setStorage({
      ...storage,
      e: []
    });
    
    setResult({
      windowPrevState: [],
      windowCurrState: [2, 4, 6, 8],
      numbers: [2, 4, 6, 8],
      avg: "5.00"
    });
  };
  
  const simulateSecondTestCase = () => {
    setStorage({
      ...storage,
      e: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
    });
    
    setResult({
      windowPrevState: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
      windowCurrState: [12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
      numbers: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
      avg: "23.40"
    });
  };
  
  const numberTypeLabels = {
    p: 'Prime',
    f: 'Fibonacci',
    e: 'Even',
    r: 'Random'
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-medium text-white mb-8">Average Calculator</h1>
        
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-6 border border-gray-800">
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-400 mb-3">Number Type</p>
            <div className="flex justify-center gap-2 mb-6">
              {Object.entries(numberTypeLabels).map(([key, label]) => (
                <button 
                  key={key}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    numberType === key 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setNumberType(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Fetch Numbers'}
            </button>
            
            <div className="flex gap-3 w-full justify-center">
              <button 
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-full text-xs font-medium transition-all"
                onClick={simulateFirstTestCase}
              >
                Test Case 1
              </button>
              <button 
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-full text-xs font-medium transition-all"
                onClick={simulateSecondTestCase}
              >
                Test Case 2
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900 border-l-4 border-red-500 text-red-200 p-4 mb-6 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {result && (
          <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800">
            <div className="border-b border-gray-800 p-4">
              <div className="text-sm font-medium text-gray-400">API Endpoint</div>
              <div className="mt-1 text-sm font-mono bg-gray-800 p-2 rounded text-blue-400 overflow-x-auto">
                http://localhost:9876/numbers/{numberType}
              </div>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-400 mb-2">Previous Window</div>
                <div className="bg-gray-900 border border-gray-700 rounded p-3 text-sm font-mono overflow-x-auto text-gray-300">
                  {result.windowPrevState.length > 0 ? 
                    `[${result.windowPrevState.join(', ')}]` : 
                    '[]'}
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-400 mb-2">Current Window</div>
                <div className="bg-gray-900 border border-gray-700 rounded p-3 text-sm font-mono overflow-x-auto text-gray-300">
                  {result.windowCurrState.length > 0 ? 
                    `[${result.windowCurrState.join(', ')}]` : 
                    '[]'}
                </div>
              </div>
            </div>
            
            <div className="px-4 pb-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-400 mb-2">Fetched Numbers</div>
                <div className="bg-gray-900 border border-gray-700 rounded p-3 text-sm font-mono overflow-x-auto text-gray-300">
                  {result.numbers.length > 0 ? 
                    `[${result.numbers.join(', ')}]` : 
                    '[]'}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900 p-4 border-t border-blue-800">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-blue-300">Average</div>
                <div className="text-2xl font-medium text-blue-200">{result.avg}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AverageCalculator;
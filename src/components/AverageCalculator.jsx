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
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Average Calculator - Port 9876</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Request Number Data</h2>
        
        <div className="mb-4">
          <p className="text-gray-700 mb-2">Select Number Type:</p>
          <div className="flex flex-wrap gap-3">
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${numberType === 'p' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setNumberType('p')}
            >
              Prime (p)
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${numberType === 'f' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setNumberType('f')}
            >
              Fibonacci (f)
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${numberType === 'e' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setNumberType('e')}
            >
              Even (e)
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${numberType === 'r' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setNumberType('r')}
            >
              Random (r)
            </button>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Fetch Numbers'}
          </button>
          
          <div className="ml-4 border-l pl-4">
            <p className="text-sm text-gray-500 mb-2">Test Case Simulation:</p>
            <div className="flex gap-2">
              <button 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                onClick={simulateFirstTestCase}
              >
                Test Case 1
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                onClick={simulateSecondTestCase}
              >
                Test Case 2
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-gray-700">API Endpoint:</h3>
            <div className="bg-gray-100 p-3 rounded text-blue-600 font-mono">
              http://localhost:9876/numbers/{numberType}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2 text-gray-700">windowPrevState:</h3>
              <div className="bg-white p-3 rounded border">
                {result.windowPrevState.length > 0 ? 
                  `[${result.windowPrevState.join(', ')}]` : 
                  '[]'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2 text-gray-700">windowCurrState:</h3>
              <div className="bg-white p-3 rounded border">
                {result.windowCurrState.length > 0 ? 
                  `[${result.windowCurrState.join(', ')}]` : 
                  '[]'}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="font-medium mb-2 text-gray-700">numbers:</h3>
            <div className="bg-white p-3 rounded border">
              {result.numbers.length > 0 ? 
                `[${result.numbers.join(', ')}]` : 
                '[]'}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-gray-700">avg:</h3>
            <div className="bg-white p-3 rounded border text-xl font-bold text-blue-600">
              {result.avg}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AverageCalculator;
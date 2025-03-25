// src/components/digital_electronics/number_systems/BinaryDemo.jsx
import React, { useEffect, useState } from 'react';

const getRandomDecimal = () => Math.floor(Math.random() * (255 - 16 + 1)) + 16; // 16–255

const BinaryDemo = () => {
  const [decimal, setDecimal] = useState(11);
  const [binary, setBinary] = useState('1011');
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [sum, setSum] = useState(0);

  const [decSteps, setDecSteps] = useState([]);
  const [decIndex, setDecIndex] = useState(0);
  const [decBinary, setDecBinary] = useState([]);

  // Format number into 4-bit binary string
  const formatTo4Bit = (num) => num.toString(2).padStart(4, '0');
  const formatTo8Bit = (num) => num.toString(2).padStart(8, '0');

  const initialize = () => {
    const newDecimal = getRandomDecimal();
    const newBinary = formatTo4Bit(newDecimal % 16); // Limit to 4-bit value

    setDecimal(newDecimal);
    setBinary(newBinary);

    const binSteps = newBinary.split('').map((bit, idx, arr) => {
      const power = arr.length - 1 - idx;
      return {
        bit,
        power,
        value: parseInt(bit) * Math.pow(2, power),
      };
    });
    setSteps(binSteps);
    setCurrentStep(0);
    setSum(0);

    // Decimal to Binary (8-bit display)
    let temp = newDecimal;
    const decList = [];
    while (temp > 0) {
      decList.push({ number: temp, bit: temp % 2 });
      temp = Math.floor(temp / 2);
    }
    while (decList.length < 8) {
      decList.push({ number: 0, bit: 0 });
    }
    setDecSteps(decList);
    setDecIndex(0);
    setDecBinary([]);
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (steps.length === 0) return;
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setSum((prev) => prev + steps[currentStep].value);
        setCurrentStep((prev) => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (decIndex < decSteps.length) {
      const timer = setTimeout(() => {
        setDecBinary((prev) => [decSteps[decIndex].bit, ...prev]);
        setDecIndex((prev) => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [decIndex, decSteps]);

  useEffect(() => {
    const loop = setTimeout(() => {
      initialize();
    }, 12000);
    return () => clearTimeout(loop);
  }, [currentStep]);

  return (
    <div className="p-4 bg-white rounded shadow border max-w-xl mx-auto mb-8 space-y-10">
      {/* Binary to Decimal */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-center text-blue-700">
          Binary to Decimal Conversion: {binary}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-3 border rounded transition-all duration-500 ${
                idx < currentStep ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <div className="text-lg font-mono">Bit: {step.bit}</div>
              <div className="text-sm">2<sup>{step.power}</sup></div>
              <div className="text-sm">= {step.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center min-h-[2.5rem] flex justify-center items-center">
          {currentStep === steps.length ? (
            <div className="text-2xl font-semibold text-green-600">
              Final Decimal Value: {sum}
            </div>
          ) : (
            <div className="text-gray-500 text-lg">Calculating...</div>
          )}
        </div>
      </div>

      <hr className="my-4 border-gray-300" />

      {/* Decimal to Binary */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-center text-purple-700">
          Decimal to Binary Conversion: {decimal}
        </h2>
        <div className="text-center text-gray-700 mb-4">
          Divide the number by 2 and track the remainders:
        </div>
        <div className="min-h-[220px] flex flex-col justify-start space-y-2 text-center transition-all duration-500">
          {decSteps.slice(0, decIndex).map((step, idx) => (
            <div key={idx} className="text-sm font-mono">
              {step.number} ÷ 2 = {Math.floor(step.number / 2)} with remainder{' '}
              <span className="font-bold text-purple-600">{step.bit}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-green-700 text-xl font-semibold">
          Binary (8-bit): {decBinary.join('').padStart(8, '0')}
        </div>
      </div>
    </div>
  );
};

export default BinaryDemo;

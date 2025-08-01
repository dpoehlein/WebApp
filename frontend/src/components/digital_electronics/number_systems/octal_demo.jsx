import React, { useEffect, useState } from 'react';

const getRandomDecimal = () => Math.floor(Math.random() * (511 - 64 + 1)) + 64; // Range for 3-digit octal

const OctalDemo = () => {
  const [decimal, setDecimal] = useState(64);
  const [octal, setOctal] = useState('100');
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [sum, setSum] = useState(0);

  const [decSteps, setDecSteps] = useState([]);
  const [decIndex, setDecIndex] = useState(0);
  const [decOctal, setDecOctal] = useState([]);

  const formatToOctal = (num) => num.toString(8);

  const initialize = () => {
    const newDecimal = getRandomDecimal();
    const newOctal = formatToOctal(newDecimal);

    setDecimal(newDecimal);
    setOctal(newOctal);

    const octalSteps = newOctal.split('').map((digit, idx, arr) => {
      const power = arr.length - 1 - idx;
      return {
        digit,
        power,
        value: parseInt(digit) * Math.pow(8, power),
      };
    });

    setSteps(octalSteps);
    setCurrentStep(0);
    setSum(0);

    // Decimal to Octal steps
    let temp = newDecimal;
    const decList = [];
    while (temp > 0) {
      decList.push({ number: temp, digit: temp % 8 });
      temp = Math.floor(temp / 8);
    }
    setDecSteps(decList);
    setDecIndex(0);
    setDecOctal([]);
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
        setDecOctal((prev) => [decSteps[decIndex].digit, ...prev]);
        setDecIndex((prev) => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [decIndex, decSteps]);

  useEffect(() => {
    const loop = setTimeout(() => {
      initialize();
    }, 18000);
    return () => clearTimeout(loop);
  }, [currentStep]);

  return (
    <div className="p-4 bg-white rounded shadow border w-full mb-8 space-y-10">
      <div className="space-y-4 text-gray-700 text-base leading-relaxed mb-6">
        <p>
          This demo helps you visualize how octal numbers (base-8) are converted to decimal, and how decimal numbers are converted to octal.
        </p>
        <p>
          Each digit in an octal number represents a power of 8, similar to how each digit in a decimal number represents a power of 10.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-center text-blue-700">
          Octal to Decimal Conversion: {octal}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-3 border rounded transition-all duration-500 ${
                idx < currentStep ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <div className="text-lg font-mono">Digit: {step.digit}</div>
              <div className="text-sm">8<sup>{step.power}</sup></div>
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

      <div>
        <h2 className="text-xl font-bold mb-4 text-center text-purple-700">
          Decimal to Octal Conversion: {decimal}
        </h2>
        <div className="text-center text-gray-700 mb-4">
          Divide the number by 8 and track the remainders (from LSB to MSB)
        </div>

        <div className="min-h-[280px] flex flex-col justify-start space-y-2 text-center transition-all duration-500">
          {decSteps.slice(0, decIndex).map((step, idx) => (
            <div key={idx} className="text-sm font-mono">
              {step.number} ÷ 8 = {Math.floor(step.number / 8)} with remainder{' '}
              <span className="font-bold text-purple-600">{step.digit}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-green-700 text-xl font-semibold">
          Octal: {decOctal.join('')}
        </div>
      </div>
    </div>
  );
};

export default OctalDemo;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, History, Settings, Calculator as CalcIcon, X, Minus, Plus, Divide, Percent, Equal } from 'lucide-react';

type Operator = '+' | '-' | '*' | '/' | null;

export default function App() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<{ eq: string; res: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const calculate = (first: number, second: number, op: Operator): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return second !== 0 ? first / second : 0;
      default: return second;
    }
  };

  const handleOperator = (nextOperator: Operator) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setEquation(`${inputValue} ${nextOperator}`);
    } else if (operator) {
      const result = calculate(prevValue, inputValue, operator);
      setPrevValue(result);
      setDisplay(String(result));
      setEquation(`${result} ${nextOperator}`);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const handleEqual = () => {
    const inputValue = parseFloat(display);

    if (operator && prevValue !== null) {
      const result = calculate(prevValue, inputValue, operator);
      const fullEquation = `${equation} ${inputValue} =`;
      
      setHistory(prev => [{ eq: fullEquation, res: String(result) }, ...prev].slice(0, 10));
      setDisplay(String(result));
      setPrevValue(null);
      setOperator(null);
      setEquation('');
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handlePercentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const handleToggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9]/.test(e.key)) handleNumber(e.key);
      if (e.key === '.') handleDecimal();
      if (e.key === '+') handleOperator('+');
      if (e.key === '-') handleOperator('-');
      if (e.key === '*') handleOperator('*');
      if (e.key === '/') handleOperator('/');
      if (e.key === 'Enter' || e.key === '=') handleEqual();
      if (e.key === 'Escape') handleClear();
      if (e.key === 'Backspace') handleBackspace();
      if (e.key === '%') handlePercentage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, prevValue, operator, waitingForOperand]);

  const Button = ({ 
    children, 
    onClick, 
    className = '', 
    variant = 'default' 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string;
    variant?: 'default' | 'operator' | 'action' | 'number';
  }) => {
    const variants = {
      default: 'bg-white hover:bg-zinc-50 text-zinc-800 shadow-sm border border-zinc-200/50',
      number: 'bg-white hover:bg-zinc-50 text-zinc-800 font-medium shadow-sm border border-zinc-200/50',
      operator: 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-md',
      action: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border border-zinc-200/50'
    };

    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`h-16 w-full rounded-2xl flex items-center justify-center text-xl transition-colors duration-200 ${variants[variant]} ${className}`}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-200 overflow-hidden border border-zinc-100"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-zinc-400">
            <CalcIcon size={18} />
            <span className="text-xs font-semibold uppercase tracking-widest">Precision Calc</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <History size={20} />
            </button>
            <button className="p-2 text-zinc-400 hover:text-zinc-600">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Display Area */}
        <div className="px-8 py-6 text-right min-h-[160px] flex flex-col justify-end relative">
          <AnimatePresence mode="wait">
            {showHistory ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 px-8 py-4 bg-white z-10 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">History</h3>
                  <button onClick={() => setHistory([])} className="text-[10px] text-zinc-400 hover:text-red-500 uppercase font-bold">Clear All</button>
                </div>
                {history.length === 0 ? (
                  <p className="text-zinc-300 text-sm italic">No calculations yet</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, i) => (
                      <div key={i} className="border-b border-zinc-50 pb-2">
                        <p className="text-xs text-zinc-400">{item.eq}</p>
                        <p className="text-sm font-semibold text-zinc-800">{item.res}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="h-6 text-zinc-400 text-sm font-medium overflow-hidden whitespace-nowrap">
            {equation}
          </div>
          <motion.div 
            key={display}
            initial={{ opacity: 0.5, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl font-light tracking-tighter text-zinc-900 overflow-hidden text-ellipsis"
          >
            {display}
          </motion.div>
        </div>

        {/* Keypad */}
        <div className="p-6 bg-zinc-50/50 grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <Button variant="action" onClick={handleClear}>AC</Button>
          <Button variant="action" onClick={handleToggleSign}>+/-</Button>
          <Button variant="action" onClick={handlePercentage}><Percent size={20} /></Button>
          <Button variant="operator" onClick={() => handleOperator('/')}><Divide size={22} /></Button>

          {/* Row 2 */}
          <Button variant="number" onClick={() => handleNumber('7')}>7</Button>
          <Button variant="number" onClick={() => handleNumber('8')}>8</Button>
          <Button variant="number" onClick={() => handleNumber('9')}>9</Button>
          <Button variant="operator" onClick={() => handleOperator('*')}><X size={22} /></Button>

          {/* Row 3 */}
          <Button variant="number" onClick={() => handleNumber('4')}>4</Button>
          <Button variant="number" onClick={() => handleNumber('5')}>5</Button>
          <Button variant="number" onClick={() => handleNumber('6')}>6</Button>
          <Button variant="operator" onClick={() => handleOperator('-')}><Minus size={22} /></Button>

          {/* Row 4 */}
          <Button variant="number" onClick={() => handleNumber('1')}>1</Button>
          <Button variant="number" onClick={() => handleNumber('2')}>2</Button>
          <Button variant="number" onClick={() => handleNumber('3')}>3</Button>
          <Button variant="operator" onClick={() => handleOperator('+')}><Plus size={22} /></Button>

          {/* Row 5 */}
          <Button variant="number" onClick={() => handleNumber('0')} className="col-span-1">0</Button>
          <Button variant="number" onClick={handleDecimal}>.</Button>
          <Button variant="action" onClick={handleBackspace}><Delete size={20} /></Button>
          <Button variant="operator" onClick={handleEqual} className="bg-emerald-500 hover:bg-emerald-600 border-none"><Equal size={24} /></Button>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="fixed bottom-8 text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-bold">
        Designed for Precision • 2026
      </div>
    </div>
  );
}

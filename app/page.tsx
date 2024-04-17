'use client';

import { Fragment, use, useCallback, useEffect, useMemo, useState } from "react";

type BarProperties = {
  title: string;
  cols: number;
};

type LineProperties = {
  cols: number;
  onUpdate: (targets: number) => void;
};

const Bar = ({title, cols}: BarProperties) => {
  const reservedChars = 6;
  const colPadding = (cols - reservedChars - title.length) / 2;

  return (
    <Fragment>
      <span>+</span>
      {Array.from({length: colPadding}, (_, k) => <span key={k}>-</span>)}
      <span>[</span>
      <span>&nbsp;</span>
      {title.split("").map((char, i) => <span key={i}>{char}</span>)}
      <span>&nbsp;</span>
      <span>]</span>
      {Array.from({length: colPadding}, (_, k) => <span key={k}>-</span>)}
      <span>+</span>
    </Fragment>
  );
};

const charPool = [".", ",", "!", ";", ":", "~", "_", "-", "+", "*", "#", "@", "$", "%", "&", "(", ")", "[", "]", "{", "}", "<", ">", "?", "/", "|", "\\"];
const lottery = 0.2;
const targetChar = "T";

const Line = ({cols, onUpdate}: LineProperties) => {
  const reservedChars = 4;
  const [points, setPoints] = useState(Array.from({length: cols - reservedChars}, () => " "));

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints((points) => {
        const newPoints = [...points];
        const targetPoint = Math.floor(Math.random() * newPoints.length);
        const newChar = Math.random() > lottery ? " " : charPool[Math.floor(Math.random() * charPool.length)];

        if (newChar === " " && newPoints[targetPoint] === targetChar) {
          return newPoints;
        }

        newPoints[targetPoint] = newChar;

        return newPoints;
      });
    }, 250 + Math.floor(Math.random() * 100));

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    onUpdate(points.filter((point) => point === targetChar).length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  const handlePointClick = useCallback((i: number) => () => {
    setPoints((points) => {
      const newPoints = [...points];
      newPoints[i] = targetChar;

      return newPoints;
    });
  }, []);

  return (
    <Fragment>
      <span>+</span>
      <span>&nbsp;</span>
      {points.map((point, i) => (
        <span 
          key={i} 
          className={`${point === targetChar ? 'text-red-500 hover:bg-red-500 hover:text-red-950' : 'text-green-500 hover:bg-green-500 hover:text-green-950'} bg-neutral-950 cursor-none`}
          onClick={handlePointClick(i)}
        >
          {point}
        </span>
      ))}
      <span>&nbsp;</span>
      <span>+</span>
    </Fragment>
  );
};

const totalCols = 40;
const totalLines = 10;
const targetCount = 10;

const Home = () => {
  const [lines, setLines] = useState(Array.from({length: totalLines}, () => 0));

  const handleLineUpdate = useCallback((lineIndex: number) => (newTargets: number) => {
    setLines((lines) => {
      const newLines = [...lines];
      newLines[lineIndex] = newTargets;

      return newLines;
    });
  }, []);

  const targetHit = useMemo(() => lines.reduce((acc, line) => acc + line, 0) >= targetCount, [lines]);

  return (
    <main className={`flex items-center justify-center h-screen text-[3vmin] ${targetHit ? 'text-red-500' : 'text-green-500'} transition-colors duration-500`}>
      <div className="text-center">
        <div
          className="m-auto inline-grid gap-0 cursor-default select-none leading-[1.5]"
          style={{gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr)`}}
        >
          <Bar title="tristo.dev" cols={totalCols}/>
          {lines.map((_, i) => (
            <Line key={i} cols={totalCols} onUpdate={handleLineUpdate(i)}/>
          ))}
          <Bar title={targetHit ? "overflow" : "Stable"} cols={totalCols}/>
        </div>
        <div className={`mt-8 ${targetHit ? 'text-red-500' : 'text-green-500'} transition-colors duration-500`}>
          {targetHit ? "[ hello@tristo.dev - github.com/r3oath ]" : "[ #####@######.### - ######.###/###### ]"}
        </div>
      </div>
    </main>
  );
};

export default Home;

import React, { useState, useRef, useEffect } from 'react';
import { Progress, Button } from 'antd';
import axios from 'axios';
import './App.css';
import 'antd/dist/antd.css';

const testSize = 5;

const App = () => {
  const [state, setState] = useState('waiting');
  const [message, setMessage] = useState('시작');
  const [result, setResult] = useState([]);
  const [rankList, setRankList] = useState([]);

  const timeout = useRef(null);
  const startTime = useRef();
  const endTime = useRef();

  const onClickScreen = () => {
    if (state === 'waiting') {
      setState('ready');
      setMessage('준비');
      screenNow();
    } else if (state === 'ready') {
      clearTimeout(timeout.current);
      setState('waiting');
      setMessage('초록색에 클릭하세요!!');
      setResult([]);
    } else if (state === 'now') {
      endTime.current = new Date();
      setResult((prev) => {
        return [...prev, endTime.current - startTime.current];
      });
      if (result.length === testSize - 1) {
        setState('exit');
        setMessage('종료');
      } else {
        setState('ready');
        setMessage('준비');
        screenNow();
      }
    }
  };
  const screenNow = () => {
    timeout.current = setTimeout(() => {
      setState('now');
      setMessage('클릭');
      startTime.current = new Date();
    }, Math.floor(Math.random() * 2000) + 3000);
  };
  const renderScoreList = () => {
    return result.length === 0 ? null : (
      <>
        {result.map((v, i) => (
          <div key={i}>
            {i + 1}회차 : {v}ms
          </div>
        ))}
      </>
    );
  };

  useEffect(() => {
    axios
    .get('http://127.0.0.1:8080/users/total-rank')
    .then((res) => {
      console.log(res.data);
      setRankList(res.data);
    })
    .catch((err) => console.error(err));
  }, [])

  return (
    <>
      <div id="back">
        <Progress percent={result.length * (100 / testSize)} status="active"></Progress>
        <div id="screen" className={state} onClick={onClickScreen}>
          <span id="message">
            {result.length === testSize ? (
              <>
                최고기록 : {Math.min(...result)}ms
                <br />
                <Button>등록</Button>
              </>
            ) : (
              message
            )}
          </span>
        </div>
        <div id="result">{renderScoreList()}</div>
              
        {rankList.map((v, i) => (
          <>
            <div key={i}>
              {i + 1}등 : {v.name}({v.ratetime}ms)
            </div>
          </>
        ))}
      </div>
    </>
  );
};

export default App;

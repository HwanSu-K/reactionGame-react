import React, { useState, useRef } from 'react';
import { Modal, Progress, Button, Typography, Space, Input } from 'antd';
import axios from 'axios';
import './App.css';
import 'antd/dist/antd.css';

const { Text } = Typography;
const testSize = 5;

const App = () => {
  const [state, setState] = useState('waiting');
  const [message, setMessage] = useState('시작');
  const [result, setResult] = useState([]);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [name, setName] = useState('');

  const onCheangeName = (e) => {
    setName(e.target.value);
  };
  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      axios.post('https://developer-green-final.click/members', {
        memberName: name,
        rateTime: parseInt(result.reduce((a, c) => a + c) / result.length),
      });

      setName('');
      setVisible(false);
      setConfirmLoading(false);
      setResult([]);
      setState('waiting');
      setMessage('시작');
    }, 2000);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const info = async () => {
    const rankList = await axios.get('https://developer-green-final.click/members/rank');

    Modal.info({
      title: '이번주 랭킹',
      content: (
        <>
          {rankList.data.map((v, i) => (
            <div key={i}>
              {i + 1}등 : {v.memberName}({v.rateTime}ms)
            </div>
          ))}
        </>
      ),
      onOk() {},
    });
  };

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
          <Text key={i}>
            {i + 1}회차 : {v}ms
          </Text>
        ))}
      </>
    );
  };

  return (
    <>
      <div id="back">
        <Progress percent={result.length * (100 / testSize)} status="active"></Progress>
        <div id="screen" className={state} onClick={onClickScreen}>
          <span id="message">
            {result.length === testSize ? (
              <>
                <Text type="secondary">평균기록 : {parseInt(result.reduce((a, c) => a + c) / result.length)}ms</Text>
                <br />
                <Button type="primary" onClick={showModal}>
                  등록
                </Button>
              </>
            ) : (
              message
            )}
          </span>
        </div>
        <p style={{ fontWeight: 'bold', fontSize: '20px' }}>테스트는 총 5회 진행 됩니다.</p>
        <p style={{ fontWeight: 'bold', fontSize: '20px' }}>초록색으로 변할때 터치해 주세요.</p>
        <Button style={{ marginBottom: 30 }} onClick={info}>
          주간 랭킹
        </Button>
        <Space direction="vertical">{renderScoreList()}</Space>
      </div>
      <Modal title="랭킹 등록" visible={visible} onOk={handleOk} confirmLoading={confirmLoading} onCancel={handleCancel}>
        <Input placeholder="닉네임을 입력하세요" value={name} onChange={onCheangeName} />
      </Modal>
    </>
  );
};

export default App;

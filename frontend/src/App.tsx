import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { env3, MPU6886Object, indexData, heavyLoad } from "./types";

import useWebsocket, { ReadyState } from "react-use-websocket";
import { LineChart, Line, YAxis, XAxis } from "recharts";
import Styles from "./index.module.scss";

function divideArrIntoPieces(arr: Array<any>, n: number) {
  let arrList = [];
  let idx = 0;
  while (idx < arr.length) {
    arrList.push(arr.splice(idx, idx + n));
  }
  return arrList;
}

type SensorData = {
  ENVIII: env3;
  MPU6886: MPU6886Object;
  indexData: indexData;
};

type Data = {
  key: number;
  value: number;
};

const App = () => {
  const useSubscribe = (onData: any) => {
    const { sendMessage, lastMessage, readyState } = useWebsocket(
      "ws://localhost:1880/ws/sensor/send"
    );
    const onDataCb = useCallback(onData, []);
    useEffect(() => {
      if (lastMessage === null) return;

      const dataRaw = JSON.parse(lastMessage.data) as SensorData;
      console.log(dataRaw);

      onDataCb(dataRaw);
    }, [lastMessage, onDataCb]);
  };

  const useGraphData = () => {
    const [data, setData] = useState<SensorData[]>([]);
    useSubscribe((newData: SensorData) => {
      setData((prev) => [...prev, newData].slice(-10));
    });
    console.log(data);
    return { data };
  };

  const { data } = useGraphData();

  const [ENV3, setENV3] = useState<Data[]>([]);
  const [MPUHead, setMPUHead] = useState<Data[]>([]);
  const [MPURight, setMPURight] = useState<Data[]>([]);
  const [MPULeft, setMPULeft] = useState<Data[]>([]);
  const [armUpDown, setArmUpDown] = useState<number>(0);

  useEffect(() => {
    if (data.length > 0) {
      const tempENV3: Data[] = [];
      const tempHead: Data[] = [];
      const tempRight: Data[] = [];
      const tempLeft: Data[] = [];
      data.forEach((data, index) => {
        tempENV3.push({ key: index, value: data.ENVIII.pressure });
        tempHead.push({ key: index, value: data.MPU6886.head.accX });
        tempRight.push({ key: index, value: data.MPU6886.right.accX });
        tempLeft.push({ key: index, value: data.MPU6886.left.accX });
      });
      setENV3(tempENV3);
      setMPUHead(tempHead);
      setMPULeft(tempLeft);
      setMPURight(tempRight);
      setArmUpDown(data[data.length - 1].indexData.armUpDown);
    }
  }, [data]);

  return (
    <div>
      <h1>腕の上げ下げ回数: {armUpDown}</h1>
      <div className={Styles.grid}>
        <div>
          <h2>気圧</h2>
          <LineChart width={400} height={400} data={ENV3}>
            <p></p>
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
            <XAxis />
            <YAxis domain={["dataMax-10", "dataMax+10"]} />
          </LineChart>
        </div>
        <div>
          <h2>head accX</h2>
          <LineChart width={600} height={400} data={MPUHead}>
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
            <XAxis />
            <YAxis domain={["dataMax-10", "dataMax+10"]} />
          </LineChart>
        </div>
        <div>
          <h2>right accX</h2>
          <LineChart width={600} height={400} data={MPURight}>
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
            <XAxis />
            <YAxis domain={["dataMax-10", "dataMax+10"]} />
          </LineChart>
        </div>
        <div>
          <h2>left accX</h2>
          <LineChart width={600} height={400} data={MPULeft}>
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
            <XAxis />
            <YAxis domain={["dataMax-10", "dataMax+10"]} />
          </LineChart>
        </div>
      </div>
    </div>
  );
};

export default App;

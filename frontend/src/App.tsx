import { useState, useEffect } from "react";
import axios from "axios";
import { env3, MPU6886Object, indexData, heavyLoad } from "./types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

function divideArrIntoPieces(arr: Array<any>, n: number) {
  let arrList = [];
  let idx = 0;
  while (idx < arr.length) {
    arrList.push(arr.splice(idx, idx + n));
  }
  return arrList;
}

const App = () => {
  const [MPU6886, setMPU6886] = useState<MPU6886Object[][] | null>(null);
  const [env3, setEnv3] = useState<null | env3[][]>(null); //平均値を出す
  const [indexData, setIndexData] = useState<null | indexData[]>(null);
  const [armUpDown, setArmUpDown] = useState<number | null>(null);
  const [head, setHead] = useState<heavyLoad[] | null>(null); //平均値を出す
  const [left, setLeft] = useState<heavyLoad[] | null>(null); //平均値を出す
  const [right, setRight] = useState<heavyLoad[] | null>(null); //平均値を出す

  //平均値たち
  const [avgHead, setAvgHead] = useState<number[] | null>(null);
  const [avgLeft, setAvgLeft] = useState<number[] | null>(null);
  const [avgRight, setAvgRight] = useState<number[] | null>(null);
  const [headHeavyLoad, setHeadHeavyLoad] = useState<number[] | null>(null);
  const [leftHeavyLoad, setLeftHeavyLoad] = useState<number[] | null>(null);
  const [rightHeavyLoad, setRightHeavyLoad] = useState<number[] | null>(null);

  const getDataFromDB = async () => {
    await axios
      .get("http://localhost:3030/api/edge_data/MPU6886")
      .then((response) => {
        console.log(response.data);
        const splitedData = divideArrIntoPieces(response.data, 60);
        console.log(splitedData);
        const mpu6886Array = setMPU6886(splitedData as MPU6886Object[][]);
      });
    await axios
      .get("http://localhost:3030/api/edge_data/ENV3")
      .then((response) => {
        console.log(response.data);
        const splitedData = divideArrIntoPieces(response.data, 60);
        console.log(splitedData);
        setEnv3(splitedData as env3[][]);
      });
    await axios
      .get("http://localhost:3030/api/edge_data/indexData")
      .then((response) => {
        console.log(response.data);
        setIndexData(response.data as indexData[]);
      });
  };

  const formatArmUpDown = () => {
    setArmUpDown(indexData![indexData!.length - 1].armUpDown);
    console.log(armUpDown);
  };

  const getHeavyLoad = () => {
    let headArray: heavyLoad[] = [];
    let leftArray: heavyLoad[] = [];
    let rightArray: heavyLoad[] = [];
    indexData!.forEach((data: indexData, index: number) => {
      if (data.diffHead > 100) {
        headArray.push({ index: index, value: data.diffHead });
      }
      if (data.diffLeft > 100) {
        leftArray.push({ index: index, value: data.diffLeft });
      }
      if (data.diffRight > 100) {
        rightArray.push({ index: index, value: data.diffRight });
      }
    });
    setHead(headArray);
    setLeft(leftArray);
    setRight(rightArray);
  };

  const caliculateAvg = () => {
    // diffの値を使うように変更する
    const tempAvgHead: number[] = [];
    const tempAvgRight: number[] = [];
    const tempAvgLeft: number[] = [];
    if (MPU6886) {
      MPU6886.forEach((data) => {
        let sumHead = 0;
        let sumLeft = 0;
        let sumRight = 0;
        data.forEach((value) => {
          sumHead +=
            Math.abs(value.head.accX) +
            Math.abs(value.head.accY) +
            Math.abs(value.head.accZ) +
            Math.abs(value.head.gyroX) +
            Math.abs(value.head.gyroY) +
            Math.abs(value.head.gyroZ);
          sumLeft +=
            Math.abs(value.left.accX) +
            Math.abs(value.left.accY) +
            Math.abs(value.left.accZ) +
            Math.abs(value.left.gyroX) +
            Math.abs(value.left.gyroY) +
            Math.abs(value.left.gyroZ);
          sumRight +=
            Math.abs(value.right.accX) +
            Math.abs(value.right.accY) +
            Math.abs(value.right.accZ) +
            Math.abs(value.right.gyroX) +
            Math.abs(value.right.gyroY) +
            Math.abs(value.right.gyroZ);
        });
        tempAvgHead.push(sumHead / data.length);
        tempAvgRight.push(sumRight / data.length);
        tempAvgLeft.push(sumLeft / data.length);
      });
    }
    setAvgHead(tempAvgHead);
    setAvgLeft(tempAvgLeft);
    setAvgRight(tempAvgRight);
  };

  const heavyLoadPerMinute = () => {
    const headArr = [0, 0, 0, 0, 0];
    const leftArr = [0, 0, 0, 0, 0];
    const rightArr = [0, 0, 0, 0, 0];
    if (head) {
      head.forEach((data) => {
        const i = Math.round(data.index / 10);
        headArr[i - 1]++;
      });
      left!.forEach((data) => {
        const i = Math.round(data.index / 10);
        leftArr[i - 1]++;
      });
      right!.forEach((data) => {
        const i = Math.round(data.index / 10);
        rightArr[i - 1]++;
      });
    }
    console.log(headArr);
    console.log(leftArr);
    console.log(rightArr);
    setHeadHeavyLoad(headArr);
    setLeftHeavyLoad(leftArr);
    setRightHeavyLoad(rightArr);
  };

  useEffect(() => {
    if (!MPU6886) {
      (async () => {
        await getDataFromDB();
      })();
    }
  });

  useEffect(() => {
    if (indexData !== null && armUpDown === null) {
      formatArmUpDown();
    }
    if (indexData !== null && head === null) {
      getHeavyLoad();
    }
    if (MPU6886 !== null && avgHead === null) {
      caliculateAvg();
    }
    if (head !== null && headHeavyLoad === null) {
      heavyLoadPerMinute();
    }
  });

  // データ可視化のデータオプション等

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Chart.js Line Chart",
      },
    },
  };

  const labels = [1, 2, 3, 4, 5];

  const MPU6886Data = {
    labels,
    datasets: [
      {
        label: "頭のacc・gyroの平均値",
        data: avgHead,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "左腕のacc・gyroの平均値",
        data: avgLeft,
        borderColor: "rgb(2, 99, 132)",
        backgroundColor: "rgba(2, 99, 132, 0.5)",
      },
      {
        label: "右腕のacc・gyroの平均値",
        data: avgRight,
        borderColor: "rgb(2, 200, 132)",
        backgroundColor: "rgba(2, 200, 132, 0.5)",
      },
    ],
  };

  const heavyLoadData = {
    labels,
    datasets: [
      {
        label: "分あたりの頭の高負荷運動の回数",
        data: headHeavyLoad,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "分あたりの左腕の高負荷運動の回数",
        data: leftHeavyLoad,
        borderColor: "rgb(2, 99, 132)",
        backgroundColor: "rgba(2, 99, 132, 0.5)",
      },
      {
        label: "分あたりの右腕の高負荷運動の回数",
        data: rightHeavyLoad,
        borderColor: "rgb(2, 200, 132)",
        backgroundColor: "rgba(2, 200, 132, 0.5)",
      },
    ],
  };

  return (
    <div>
      <h1>データを可視化プロジェクト</h1>
      {armUpDown && (
        <>
          <h2>腕の上げ下げ回数: {armUpDown}</h2>
        </>
      )}
      {avgHead && <Line options={options} data={MPU6886Data}></Line>}
      {headHeavyLoad && <Line options={options} data={heavyLoadData} />}
    </div>
  );
};

export default App;

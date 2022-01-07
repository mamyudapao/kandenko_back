import { useState, useEffect } from "react";
import axios from "axios";
import { env3, MPU6886Object, indexData } from "./types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

/**
 * 配列を指定した単位で分割する
 * @param arr 分割する配列
 * @param n 分割する単位
 * @returns 分割された配列
 * @example
 * ```ts
 * divideArrIntoPieces([0, 1, 2, 3, 4, 5, 6, 7], 3) // [[0, 1, 2], [3, 4, 5], [6, 7]]
 * ```
 */
const divideArrIntoPieces = <T extends unknown>(
  arr: ReadonlyArray<T>,
  n: number
): ReadonlyArray<ReadonlyArray<T>> => {
  return Array.from({ length: Math.ceil(arr.length / n) }).map((_, index) => {
    return arr.slice(index * n, (index + 1) * n);
  });
};

/**
 * 60秒ごとの平均
 */
const calculateMPU6886Average = (
  MPU6886: ReadonlyArray<MPU6886Object>
): ReadonlyArray<{
  readonly head: number;
  readonly left: number;
  readonly right: number;
}> => {
  return divideArrIntoPieces(MPU6886, 60).map((data) => {
    const sum = data.reduce(
      (sum, value) => ({
        head:
          sum.head +
          Math.abs(value.head.accX) +
          Math.abs(value.head.accY) +
          Math.abs(value.head.accZ) +
          Math.abs(value.head.gyroX) +
          Math.abs(value.head.gyroY) +
          Math.abs(value.head.gyroZ),
        left:
          sum.left +
          Math.abs(value.left.accX) +
          Math.abs(value.left.accY) +
          Math.abs(value.left.accZ) +
          Math.abs(value.left.gyroX) +
          Math.abs(value.left.gyroY) +
          Math.abs(value.left.gyroZ),
        right:
          sum.right +
          Math.abs(value.right.accX) +
          Math.abs(value.right.accY) +
          Math.abs(value.right.accZ) +
          Math.abs(value.right.gyroX) +
          Math.abs(value.right.gyroY) +
          Math.abs(value.right.gyroZ),
      }),
      { head: 0, left: 0, right: 0 }
    );
    return {
      head: sum.head / data.length,
      right: sum.right / data.length,
      left: sum.left / data.length,
    };
  });
};

const labels: ReadonlyArray<number> = [1, 2, 3, 4, 5];

const calculateMPU6886AverageChartData = (
  MPU6886: ReadonlyArray<MPU6886Object>
): ChartData<"line", ReadonlyArray<number>, number> => {
  const MPU6886Average = calculateMPU6886Average(MPU6886);
  return {
    labels: [...labels],
    datasets: [
      {
        label: "頭のacc・gyroの平均値",
        data: MPU6886Average.map((e) => e.head),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "左腕のacc・gyroの平均値",
        data: MPU6886Average.map((e) => e.left),
        borderColor: "rgb(2, 99, 132)",
        backgroundColor: "rgba(2, 99, 132, 0.5)",
      },
      {
        label: "右腕のacc・gyroの平均値",
        data: MPU6886Average.map((e) => e.right),
        borderColor: "rgb(2, 200, 132)",
        backgroundColor: "rgba(2, 200, 132, 0.5)",
      },
    ],
  };
};

const addOneAt = (
  array: ReadonlyArray<number>,
  index: number
): ReadonlyArray<number> => {
  const result: Array<number> = [...array];
  if (result[index] === undefined) {
    result[index] = 0;
  } else {
    result[index] += 1;
  }
  return result;
};

const calculateHeavyLoadPerMinute = (
  indexData: ReadonlyArray<indexData>
): {
  readonly headHeavyLoad: ReadonlyArray<number>;
  readonly leftHeavyLoad: ReadonlyArray<number>;
  readonly rightHeavyLoad: ReadonlyArray<number>;
} => {
  const headArr = indexData.reduce<ReadonlyArray<number>>(
    (arr, data, index) => {
      if (data.diffHead > 100) {
        return addOneAt(arr, Math.round(index / 10) - 1);
      }
      return arr;
    },
    []
  );
  const leftArr = indexData.reduce<ReadonlyArray<number>>(
    (arr, data, index) => {
      if (data.diffLeft > 100) {
        return addOneAt(arr, Math.round(index / 10) - 1);
      }
      return arr;
    },
    []
  );
  const rightArr = indexData.reduce<ReadonlyArray<number>>(
    (arr, data, index) => {
      if (data.diffRight > 100) {
        return addOneAt(arr, Math.round(index / 10) - 1);
      }
      return arr;
    },
    []
  );
  console.log(headArr);
  console.log(leftArr);
  console.log(rightArr);
  return {
    headHeavyLoad: headArr,
    leftHeavyLoad: leftArr,
    rightHeavyLoad: rightArr,
  };
};

const calculateHeavyLoadPerMinuteChartData = (
  indexData: ReadonlyArray<indexData>
): ChartData<"line", ReadonlyArray<number>, number> => {
  const heavyLoadPerMinute = calculateHeavyLoadPerMinute(indexData);
  return {
    labels: [...labels],
    datasets: [
      {
        label: "分あたりの頭の高負荷運動の回数",
        data: heavyLoadPerMinute.headHeavyLoad,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "分あたりの左腕の高負荷運動の回数",
        data: heavyLoadPerMinute.leftHeavyLoad,
        borderColor: "rgb(2, 99, 132)",
        backgroundColor: "rgba(2, 99, 132, 0.5)",
      },
      {
        label: "分あたりの右腕の高負荷運動の回数",
        data: heavyLoadPerMinute.rightHeavyLoad,
        borderColor: "rgb(2, 200, 132)",
        backgroundColor: "rgba(2, 200, 132, 0.5)",
      },
    ],
  };
};

export const App = (): JSX.Element => {
  const [MPU6886, setMPU6886] = useState<
    ReadonlyArray<MPU6886Object> | undefined
  >(undefined);
  const [env3, setEnv3] = useState<ReadonlyArray<env3> | undefined>(undefined);
  const [indexData, setIndexData] = useState<
    ReadonlyArray<indexData> | undefined
  >(undefined);

  const getDataFromDB = (): void => {
    axios
      .get<ReadonlyArray<MPU6886Object>>(
        "http://localhost:3030/api/edge_data/MPU6886"
      )
      .then((response) => {
        console.log({ MPU6886: response.data });
        setMPU6886(response.data);
      });
    axios
      .get<ReadonlyArray<env3>>("http://localhost:3030/api/edge_data/ENV3")
      .then((response) => {
        console.log({ env3: response.data });
        setEnv3(response.data);
      });
    axios
      .get<ReadonlyArray<indexData>>(
        "http://localhost:3030/api/edge_data/indexData"
      )
      .then((response) => {
        console.log({ indexData: response.data });
        setIndexData(response.data);
      });
  };

  useEffect((): void => {
    getDataFromDB();
  }, []);

  const armUpDown: number | undefined =
    indexData === undefined
      ? undefined
      : indexData[indexData.length - 1]?.armUpDown;
  console.log({ armUpDown });

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

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Chart.js Line Chart",
      },
    },
  };

  return (
    <div>
      <h1>データを可視化プロジェクト</h1>
      {armUpDown && (
        <>
          <h2>腕の上げ下げ回数: {armUpDown}</h2>
        </>
      )}
      {MPU6886 && (
        <Line
          options={options}
          data={calculateMPU6886AverageChartData(MPU6886)}
        ></Line>
      )}
      {indexData && (
        <Line
          options={options}
          data={calculateHeavyLoadPerMinuteChartData(indexData)}
        />
      )}
    </div>
  );
};

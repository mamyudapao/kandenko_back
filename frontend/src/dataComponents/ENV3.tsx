import { useState } from "react";
import { Line } from "react-chartjs-2";
import { env3 } from "../types";

type propsType = {
  data: env3[];
};

const ENV3 = (props: propsType) => {
  console.log(props);
  const [displayData, setDisplayData] = useState<any>(null);
  if (props.data !== null) {
    const pressures = props.data.map((dataArray: any) => {
      return dataArray.pressure;
    });
    const times = props.data.map((dataArray: any) => {
      return dataArray.created_at;
    });
    const data = [];
    for (let i = 0; i < pressures.length; i++) {
      data.push({ x: times[i], y: pressures[i] });
    }
    console.log(data);
    setDisplayData(data);
  }
  return <h2>env3のセンサデータ</h2>;
};

export default ENV3;

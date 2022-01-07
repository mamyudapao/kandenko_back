export type env3 = {
  cTemp: number;
  humidity: number;
  pressure: number;
  standardPressure: number;
  created_at: string;
  _id: string;
};

export type MPU6886Object = {
  head: MPU6886Data;
  left: MPU6886Data;
  right: MPU6886Data;
  _id: string;
  created_at: string;
};

export type MPU6886Data = {
  accX: number;
  accY: number;
  accZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
};

export type indexData = {
  _id: string;
  armUpDown: number;
  diffHead: number;
  diffRight: number;
  diffLeft: number;
  created_at: string;
};

export type heavyLoad = {
  index: number;
  value: number;
};

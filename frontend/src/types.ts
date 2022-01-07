export type env3 = {
  readonly cTemp: number;
  readonly humidity: number;
  readonly pressure: number;
  readonly standardPressure: number;
  readonly created_at: string;
  readonly _id: string;
};

export type MPU6886Object = {
  readonly head: MPU6886Data;
  readonly left: MPU6886Data;
  readonly right: MPU6886Data;
  readonly _id: string;
  readonly created_at: string;
};

export type MPU6886Data = {
  readonly accX: number;
  readonly accY: number;
  readonly accZ: number;
  readonly gyroX: number;
  readonly gyroY: number;
  readonly gyroZ: number;
};

export type indexData = {
  readonly _id: string;
  readonly armUpDown: number;
  readonly diffHead: number;
  readonly diffRight: number;
  readonly diffLeft: number;
  readonly created_at: string;
};

export type heavyLoad = {
  readonly index: number;
  readonly value: number;
};

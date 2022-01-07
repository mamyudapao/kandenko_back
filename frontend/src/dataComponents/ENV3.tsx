import { env3 } from "../types";

type propsType = {
  readonly data?: ReadonlyArray<env3> | undefined;
};

export const ENV3 = (props: propsType): JSX.Element => {
  console.log(props);
  if (props.data === undefined) {
    return <div>読み込み中</div>;
  }
  const displayData = props.data.map((item) => ({
    x: item.created_at,
    y: item.pressure,
  }));
  console.log(displayData);

  return <h2>env3のセンサデータ</h2>;
};

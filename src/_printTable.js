import { sprintf } from "sprintf-js";
import { trySerialize } from "./_trySerialize";

const printTable = actions => {
  const longestMessage: number = actions.reduce(
    (last, action) => Math.max(last, action.type.length),
    0
  );

  const printAction = ({ type, ...props }) =>
    sprintf(`\t%${longestMessage + 3}s\t%s`, type, trySerialize(props));

  return `${sprintf(`\t%${longestMessage + 3}s\t%s`, "TYPE", "PROPS")}
  ${actions.map(printAction).join("\n")}`;
};

export { printTable };

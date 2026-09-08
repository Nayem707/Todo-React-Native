import { Screen } from "../../components/common";
import { Loader } from "../../components/ui";

export function SessionLoader() {
  return (
    <Screen className="items-center justify-center">
      <Loader size="large" />
    </Screen>
  );
}

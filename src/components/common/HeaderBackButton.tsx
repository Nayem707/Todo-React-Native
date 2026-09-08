import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

import { IconButton } from "../ui/IconButton";

export function HeaderBackButton() {
  const router = useRouter();

  return (
    <IconButton
      icon={ChevronLeft}
      accessibilityLabel="Back"
      onPress={() => router.back()}
    />
  );
}

import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { chatTheme } from "../chatTheme";

function Doodle({ x, y }: { x: number; y: number }) {
  return (
    <Path
      d={`M ${x} ${y} c 8 -6 16 4 8 10 c -6 4 -14 -2 -8 -10 z`}
      fill="none"
      stroke="#B9AFA3"
      strokeWidth="1.2"
    />
  );
}

export function ChatWallpaper() {
  const tiles: Array<{ x: number; y: number }> = [];

  for (let row = 0; row < 18; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      tiles.push({
        x: col * 42 + (row % 2) * 16,
        y: row * 48,
      });
    }
  }

  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: chatTheme.wallpaper }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 400 900" preserveAspectRatio="xMidYMid slice">
        {tiles.map((tile) => (
          <Doodle key={`${tile.x}-${tile.y}`} x={tile.x} y={tile.y} />
        ))}
        {tiles.map((tile, index) =>
          index % 5 === 0 ? (
            <Circle
              key={`c-${tile.x}-${tile.y}`}
              cx={tile.x + 18}
              cy={tile.y + 22}
              r={3}
              fill="#C4B8AA"
            />
          ) : null,
        )}
      </Svg>
    </View>
  );
}

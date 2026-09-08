import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type BrandSplashProps = {
  onFinish: () => void;
  backgroundColor?: string;
  gradientColors?: [string, string, ...string[]];
};

export function BrandSplash({
  onFinish,
  backgroundColor = "#0f172a",
  gradientColors = ["#0f172a", "#1a1a2e"],
}: BrandSplashProps) {
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(50)).current;
  const textScale = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.back(0.8)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(900),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        Animated.parallel([
          Animated.timing(circleOpacity, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          onFinish();
        });
      }
    });

    return () => {
      animation.stop();
    };
  }, [
    circleScale,
    circleOpacity,
    textOpacity,
    textTranslateY,
    textScale,
    glowOpacity,
    onFinish,
  ]);

  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 z-50"
      style={{ backgroundColor }}
    >
      <LinearGradient
        colors={gradientColors}
        className="absolute inset-0"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          style={{
            opacity: circleOpacity,
            transform: [{ scale: circleScale }],
          }}
        >
          <View className="h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-cyan-500/20">
            <Text className="text-5xl font-bold text-white/90">C</Text>
          </View>
        </Animated.View>
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }, { scale: textScale }],
          }}
          className="mt-8"
        >
          <Text className="text-2xl font-bold tracking-wider text-white">
            Chat
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

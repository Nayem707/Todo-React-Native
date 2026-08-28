import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

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
  const versionOpacity = useRef(new Animated.Value(0)).current;
  const versionTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      // Circle appears with scale animation
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

      // Delay before text appears
      Animated.delay(400),

      // Text slides up and scales
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

      // Delay before version appears
      Animated.delay(300),

      // Text fades in while moving upward
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
      ]),

      // Hold for a moment before finishing
      Animated.delay(600),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        // Exit animation
        Animated.parallel([
          Animated.timing(circleOpacity, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(circleScale, {
            toValue: 0.9,
            duration: 400,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 0.5,
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
    versionOpacity,
    versionTranslateY,
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

      {/* Decorative background elements */}
      <View className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
      <View className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
      <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-2xl" />

      {/* Main content - centered */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Circular shape with brand initial */}
        <Animated.View
          style={{
            opacity: circleOpacity,
            transform: [{ scale: circleScale }],
          }}
        >
          <View className="relative">
            {/* Main circle with gradient */}
            <View className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 items-center justify-center border border-white/10">
              {/* Inner glow ring */}
              <View className="absolute inset-2 rounded-full border border-white/5" />

              {/* Brand initial */}
              <Text className="text-5xl font-bold text-white/90">T</Text>
            </View>

            {/* Rotating ring animation */}
            <View className="absolute inset-0 rounded-full border-2 border-white/5" />
            <View
              className="absolute inset-[-4px] rounded-full border-2 border-t-cyan-400/30 border-r-transparent border-b-transparent border-l-transparent"
              style={{
                transform: [{ rotate: "45deg" }],
              }}
            />
          </View>
        </Animated.View>
        {/* "Todo" text that rises up */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          }}
          className="mt-8"
        >
          <Text className="text-2xl font-bold text-white tracking-wider">
            Todo App
          </Text>
        </Animated.View>
      </View>

      {/* Footer - only version number */}
      <View className="absolute bottom-0 left-0 right-0 items-center pb-12">
        <Text className="text-[10px] font-light tracking-[0.3em] text-white/20">
          v3.0.0
        </Text>
      </View>
    </View>
  );
}

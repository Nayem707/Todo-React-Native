import { useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";

import { KeyboardAvoidingWrapper, Screen } from "../../../components/common";
import { Button, Card, Input, Text } from "../../../components/ui";
import { register } from "../../../store/slices";
import { useAppDispatch } from "../../../store/hooks";

export function RegisterScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await dispatch(register({ name, email, password })).unwrap();
    } catch (reason) {
      setError(typeof reason === "string" ? reason : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen className="px-6 py-8">
      <KeyboardAvoidingWrapper>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="grow"
        >
        <Card className="gap-4 p-6">
          <Text variant="title">Create account</Text>
          <Text variant="muted">
            This only creates a local session on this device. It is not a
            server account.
          </Text>
          <Input
            label="Name"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            editable={!isSubmitting}
          />
          <Input
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
          />
          <Input
            label="Password"
            secureTextEntry
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
          />
          {error ? (
            <Text variant="caption" className="text-danger">
              {error}
            </Text>
          ) : null}
          <Button
            label={isSubmitting ? "Creating session..." : "Continue"}
            disabled={isSubmitting}
            onPress={() => {
              void handleRegister();
            }}
          />
          <Button
            variant="ghost"
            label="Already have an account"
            disabled={isSubmitting}
            onPress={() => router.push("/login")}
          />
        </Card>
        </ScrollView>
      </KeyboardAvoidingWrapper>
    </Screen>
  );
}

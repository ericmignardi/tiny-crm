import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { AvatarKind, pickImage, uploadAvatar } from "../lib/avatars";

type AvatarPickerProps = {
  avatarUrl: string | null;
  userId: string;
  kind: AvatarKind;
  entityId: string;
  size?: number;
  label?: string;
  onUploaded: (publicUrl: string) => void;
};

export function AvatarPicker({
  avatarUrl,
  userId,
  kind,
  entityId,
  size = 96,
  label,
  onUploaded,
}: AvatarPickerProps) {
  const [uploading, setUploading] = useState<boolean>(false);

  const handlePick = async () => {
    try {
      const picked = await pickImage();
      if (!picked) return;
      setUploading(true);
      const publicUrl = await uploadAvatar(userId, kind, entityId, picked);
      onUploaded(publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not upload photo.";
      Alert.alert("Photo upload failed", message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex flex-col items-center gap-2">
      <TouchableOpacity
        onPress={handlePick}
        disabled={uploading}
        accessibilityLabel="Change photo"
        style={{ width: size, height: size }}
        className="rounded-full bg-primary items-center justify-center overflow-hidden"
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: size, height: size }}
            contentFit="cover"
          />
        ) : (
          <Ionicons name="person" size={size / 2.5} color="#fff" />
        )}
        {uploading && (
          <View className="absolute inset-0 items-center justify-center bg-black/40">
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </TouchableOpacity>
      <Text className="text-textMuted">{label ?? (avatarUrl ? "Change photo" : "Add photo")}</Text>
    </View>
  );
}

type AvatarProps = {
  avatarUrl: string | null;
  name: string;
  size?: number;
};

export function Avatar({ avatarUrl, name: _name, size = 48 }: AvatarProps) {
  if (avatarUrl) {
    return (
      <View
        style={{ width: size, height: size }}
        className="rounded-full overflow-hidden bg-primary"
      >
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      </View>
    );
  }

  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full bg-primary items-center justify-center"
    >
      <Ionicons name="person" size={size / 2.5} color="#fff" />
    </View>
  );
}

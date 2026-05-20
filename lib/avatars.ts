import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";

export type AvatarKind = "profile" | "person";

const AVATARS_BUCKET = "avatars";

const inferContentType = (mimeType: string | null | undefined): string => {
  if (mimeType && mimeType.startsWith("image/")) return mimeType;
  return "image/jpeg";
};

const inferExtension = (contentType: string): string => {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/heic") return "heic";
  return "jpg";
};

export type PickedImage = {
  base64: string;
  contentType: string;
};

export const pickImage = async (): Promise<PickedImage | null> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Photo access is required to choose a picture.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });

  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.base64) return null;

  return {
    base64: asset.base64,
    contentType: inferContentType(asset.mimeType),
  };
};

export const uploadAvatar = async (
  userId: string,
  kind: AvatarKind,
  entityId: string,
  image: PickedImage,
): Promise<string> => {
  const ext = inferExtension(image.contentType);
  const path = `${userId}/${kind}-${entityId}.${ext}`;

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, decode(image.base64), {
      contentType: image.contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
};

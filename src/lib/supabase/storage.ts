import { dataURLtoBlob } from "../utils";
import { fetch_user_id } from "./authenticate";
import supabase from "./supabase_init";

const save_image = async (blob: Blob, path: string) => {
  const { data, error } = await supabase.storage
    .from("thumbnails")
    .upload(path, blob);

  if (error) {
    throw new Error(
      `Supabase error (${JSON.stringify(error)}): ${error.message}`
    );
  }
  console.log("data:", data);

  return data.path;
};

export { save_image };

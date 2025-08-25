import supabase from "./supabase_init";


const save_image = async (captured: any) => {
    const { data, error } = await supabase.storage
    .from("thumbnails")
    .upload("thumbnail.png", captured);

    if (error) {
        throw new Error(`Supabase error (${error.name}): ${error.message}`);
    }

    return data.path;
}
import { ScrollData } from "@/entrypoints/shared/message_types";

const get_scroll_data = () : ScrollData => {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const documentHeight = document.body.scrollHeight;
    const windowHeight = window.innerHeight;
    return {
        scrollX,
        scrollY,
        documentHeight,
        windowHeight,
    };
};

export default get_scroll_data;

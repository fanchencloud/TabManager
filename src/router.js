import Test from "./pages/test.vue";
import Haha from "./pages/haha.vue";
import Main from "./views/Main.vue";
import WorkspaceManager from "./views/workspaceManager.vue";

export const routes = {
    "/": Main,
    "/workspaceManager": WorkspaceManager,
    "/test": Test,
    "/haha": Haha,
}

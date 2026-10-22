import DefaultTheme from "vitepress/theme";
import ProjectOverviewMap from "./components/ProjectOverviewMap.vue";
import DocGallery from "./components/DocGallery.vue";
import DocFigure from "./components/DocFigure.vue";
import UiExample from "./components/UiExample.vue";
import Home from "./components/Home.vue";
import EventJourney from "./components/EventJourney.vue";
import OathOverviewMap from "./components/OathOverviewMap.vue";
import "./style.css";
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("HymioHome", Home);
    app.component("DocFigure", DocFigure);
    app.component("DocGallery", DocGallery);
    app.component("ProjectOverviewMap", ProjectOverviewMap);
    app.component("UiExample", UiExample);
    app.component("EventJourney", EventJourney);
    app.component("OathOverviewMap", OathOverviewMap);
  },
};

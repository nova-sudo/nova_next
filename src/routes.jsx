const routes = {
  landingPage: "/",
  auth: "/auth",
  ideas: "/ideas",
  ideation: "/ideation",//old route, should redirect to /ideas
  savedIdeas: "/saved-ideas",
  viewIdea: "/idea/:id/:title?",// title is optional
  topics: "/topic/:topic",
  profile: "/profile",
  buyCredit: "/buy-credit",
};

export default routes;

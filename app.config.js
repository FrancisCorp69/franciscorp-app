const appJson = require("./app.json");

module.exports = ({ config }) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  return {
    ...appJson.expo,

    extra: {
      ...(appJson.expo.extra || {}),
      googleMapsApiKey: apiKey || "",
    },

    plugins: (appJson.expo.plugins || []).map((plugin) => {
      if (
        Array.isArray(plugin) &&
        plugin[0] === "react-native-maps"
      ) {
        return [
          "react-native-maps",
          {
            ...(plugin[1] || {}),
            androidGoogleMapsApiKey: apiKey || "",
          },
        ];
      }

      return plugin;
    }),
  };
};

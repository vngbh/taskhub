module.exports = {
  client: {
    service: {
      name: "taskhub",
      localSchemaFile: "./apps/api/src/schema.gql",
    },
    includes: ["./apps/web/src/**/*.{ts,tsx}"],
  },
};

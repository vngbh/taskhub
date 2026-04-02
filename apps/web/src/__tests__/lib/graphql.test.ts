/**
 * Unit tests for @/lib/graphql
 *
 * Verifies that:
 * - getSdkClient returns an SDK object with the expected methods
 * - Bearer token is forwarded in the Authorization header
 * - Unauthenticated clients send no Authorization header
 */
import { getClient, getSdkClient } from "@/lib/graphql";

// Mock graphql-request to avoid real network calls
jest.mock("graphql-request", () => {
  const mockRequest = jest.fn();
  const MockGraphQLClient = jest
    .fn()
    .mockImplementation((url: string, options: Record<string, unknown>) => ({
      request: mockRequest,
      url,
      options,
    }));
  return { GraphQLClient: MockGraphQLClient };
});

// Mock the generated SDK so we don't depend on server being up
jest.mock("@/graphql/generated", () => ({
  getSdk: jest.fn((client: unknown) => ({
    _client: client,
    GetTasks: jest.fn(),
    GetTasksCount: jest.fn(),
    GetMe: jest.fn(),
    CreateTask: jest.fn(),
    UpdateTask: jest.fn(),
    DeleteTask: jest.fn(),
  })),
}));

import { GraphQLClient } from "graphql-request";
import { getSdk } from "@/graphql/generated";

const MockGraphQLClient = GraphQLClient as jest.MockedClass<
  typeof GraphQLClient
>;
const mockGetSdk = getSdk as jest.MockedFunction<typeof getSdk>;

describe("lib/graphql", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getClient", () => {
    it("creates GraphQLClient pointing to the API URL", () => {
      getClient();
      expect(MockGraphQLClient).toHaveBeenCalledWith(
        expect.stringContaining("graphql"),
        expect.any(Object),
      );
    });

    it("includes Authorization header when token is provided", () => {
      const token = "test-jwt-token";
      getClient(token);
      expect(MockGraphQLClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        }),
      );
    });

    it("sends empty headers when no token is provided", () => {
      getClient();
      expect(MockGraphQLClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ headers: {} }),
      );
    });
  });

  describe("getSdkClient", () => {
    it("calls getSdk with a GraphQLClient instance", () => {
      getSdkClient("some-token");
      expect(MockGraphQLClient).toHaveBeenCalledTimes(1);
      expect(mockGetSdk).toHaveBeenCalledWith(expect.any(Object));
    });

    it("returns an object with all expected SDK methods", () => {
      const sdk = getSdkClient("token");
      expect(sdk).toHaveProperty("GetTasks");
      expect(sdk).toHaveProperty("GetTasksCount");
      expect(sdk).toHaveProperty("GetMe");
      expect(sdk).toHaveProperty("CreateTask");
      expect(sdk).toHaveProperty("UpdateTask");
      expect(sdk).toHaveProperty("DeleteTask");
    });
  });
});

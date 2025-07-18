#!/usr/bin/env node

const axios = require("axios");

const BACKEND_URL = "http://localhost:4001/graphql";

const testAuth = async () => {
  console.log("Testing AgroTech Authentication System...\n");

  try {
    // Test 1: Register a new user
    console.log("1. Testing user registration...");
    const registerMutation = `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          token
          user {
            id
            username
            email
          }
        }
      }
    `;

    const registerResponse = await axios.post(BACKEND_URL, {
      query: registerMutation,
      variables: {
        input: {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        },
      },
    });

    if (registerResponse.data.errors) {
      console.log(
        "Registration error (expected if user exists):",
        registerResponse.data.errors[0].message
      );
    } else {
      console.log("✓ Registration successful!");
      console.log(
        "Token:",
        registerResponse.data.data.register.token.substring(0, 20) + "..."
      );
      console.log("User:", registerResponse.data.data.register.user);
    }

    // Test 2: Login with existing user
    console.log("\n2. Testing user login...");
    const loginMutation = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          token
          user {
            id
            username
            email
          }
        }
      }
    `;

    const loginResponse = await axios.post(BACKEND_URL, {
      query: loginMutation,
      variables: {
        input: {
          email: "john@example.com",
          password: "password123",
        },
      },
    });

    if (loginResponse.data.errors) {
      console.log("✗ Login failed:", loginResponse.data.errors[0].message);
      return;
    }

    console.log("✓ Login successful!");
    const token = loginResponse.data.data.login.token;
    console.log("Token:", token.substring(0, 20) + "...");
    console.log("User:", loginResponse.data.data.login.user);

    // Test 3: Test authenticated request
    console.log("\n3. Testing authenticated request...");
    const meQuery = `
      query GetMe {
        me {
          id
          username
          email
          bio
          is_verified
        }
      }
    `;

    const meResponse = await axios.post(
      BACKEND_URL,
      {
        query: meQuery,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (meResponse.data.errors) {
      console.log(
        "✗ Authenticated request failed:",
        meResponse.data.errors[0].message
      );
    } else {
      console.log("✓ Authenticated request successful!");
      console.log("User profile:", meResponse.data.data.me);
    }

    // Test 4: Test invalid token
    console.log("\n4. Testing invalid token...");
    const invalidTokenResponse = await axios.post(
      BACKEND_URL,
      {
        query: meQuery,
      },
      {
        headers: {
          Authorization: "Bearer invalid-token",
          "Content-Type": "application/json",
        },
      }
    );

    if (invalidTokenResponse.data.errors) {
      console.log("✓ Invalid token properly rejected");
    } else {
      console.log("✗ Invalid token was accepted (security issue!)");
    }

    console.log("\n✓ Authentication system test completed successfully!");
  } catch (error) {
    console.error("Error during authentication test:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
};

testAuth();

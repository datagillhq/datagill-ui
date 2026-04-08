import React from "react";
import "@testing-library/jest-dom";
import "@testing-library/react";

// @base-ui/react requires React in global scope
(globalThis as unknown as Record<string, unknown>).React = React;

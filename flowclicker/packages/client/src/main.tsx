import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Web3Provider } from "./providers/Web3Provider";
import { GraphQLProvider } from "./providers/GraphQLProvider";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GraphQLProvider>
      <Web3Provider>
        <App />
      </Web3Provider>
    </GraphQLProvider>
  </React.StrictMode>
);

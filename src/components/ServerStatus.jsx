import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const ServerStatus = () => {
  const [status, setStatus] = useState("checking");
  const [lastChecked, setLastChecked] = useState(null);

  const checkServerStatus = async () => {
    setStatus("checking");
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        timeout: 5000,
      });

      if (response.ok) {
        setStatus("online");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Server status check failed:", error);
      setStatus("offline");
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkServerStatus();
    // Check every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "offline":
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "checking":
        return "Checking...";
      case "online":
        return "Server Online";
      case "offline":
        return "Server Offline";
      case "error":
        return "Server Error";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "text-green-600 dark:text-green-400";
      case "offline":
      case "error":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {getStatusIcon()}
      <span className={getStatusColor()}>{getStatusText()}</span>
      {lastChecked && (
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          ({lastChecked.toLocaleTimeString()})
        </span>
      )}
      <button
        onClick={checkServerStatus}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        disabled={status === "checking"}
      >
        Refresh
      </button>
    </div>
  );
};

export default ServerStatus;






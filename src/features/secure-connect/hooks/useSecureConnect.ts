"use client";

import { useEffect, useState } from "react";

import { secureConnectService } from "../services/secureConnect.service";
import { CallRequest } from "../types";

export function useSecureConnect() {
  const [requests, setRequests] = useState<CallRequest[]>([]);

  async function refresh() {
    setRequests(await secureConnectService.list());
  }

  useEffect(() => {
    refresh();
  }, []);

  return {
    requests,
    refresh,
    create: secureConnectService.create,
    updateStatus: secureConnectService.updateStatus,
  };
}
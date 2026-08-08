"use client";

import { useState } from "react";

import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";

import { secureConnectService } from "../services/secureConnect.service";
import { CallType } from "../types";

interface Props {
  open: boolean;
  memberId: number;
  memberName: string;
  onClose: () => void;
}

export default function RequestCallModal({
  open,
  memberId,
  memberName,
  onClose,
}: Props) {
  const [type, setType] = useState<CallType>("audio");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(20);
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function submit() {
    await secureConnectService.create({
      memberId,
      memberName,
      type,
      requestedDate: date,
      requestedTime: time,
      duration,
      message,
    });

    alert("Secure Call Request Sent.");

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <Card>
        <div className="w-[500px] space-y-6">

          <h2 className="text-2xl font-bold text-[#0B2D5C]">
            Request Secure Call
          </h2>

          <div>
            <label className="mb-2 block font-medium">
              Call Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as CallType)
              }
              className="w-full rounded-lg border p-3"
            >
              <option value="audio">
                Audio Call
              </option>

              <option value="video">
                Video Call
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Date
            </label>

            <input
              type="date"
              className="w-full rounded-lg border p-3"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Time
            </label>

            <input
              type="time"
              className="w-full rounded-lg border p-3"
              value={time}
              onChange={(e) =>
                setTime(e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Duration
            </label>

            <select
              className="w-full rounded-lg border p-3"
              value={duration}
              onChange={(e) =>
                setDuration(Number(e.target.value))
              }
            >
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Message (Optional)
            </label>

            <textarea
              rows={3}
              className="w-full rounded-lg border p-3"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
            />
          </div>

          <div className="flex justify-end gap-3">

            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={submit}
            >
              Send Request
            </Button>

          </div>

        </div>
      </Card>
    </div>
  );
}
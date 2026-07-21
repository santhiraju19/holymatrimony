"use client";

import Button from "@/components/ui/Button";
import { Smartphone } from "lucide-react";

export default function DownloadApp() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20 text-white">

      <div className="container mx-auto px-6">

        <div className="mx-auto max-w-3xl text-center">

          <Smartphone className="mx-auto mb-6 h-14 w-14" />

          <h2 className="text-4xl font-bold">
            Holy Matrimony Mobile App
          </h2>

          <p className="mt-6 text-lg text-blue-100">
            Find your God-ordained life partner anywhere,
            anytime.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <Button
              variant="secondary"
            >
              Google Play
            </Button>

            <Button
              variant="outline"
            >
              App Store
            </Button>

          </div>

        </div>

      </div>

    </section>
  );
}
"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface PricingCardProps {
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export default function PricingCard({
  name,
  price,
 duration,
  description,
  features,
  popular = false,
}: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        className={`relative flex h-full flex-col p-8 ${
          popular ? "border-blue-600" : ""
        }`}
      >
        {popular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <Badge>
              <Sparkles className="mr-1 h-3 w-3" />
              Most Popular
            </Badge>
          </div>
        )}

        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold">
            {name}
          </h3>

          <p className="mt-2 text-slate-500">
            {description}
          </p>

          <div className="mt-6">
            <div className="text-5xl font-extrabold">
              ₹{price}
            </div>

            <div className="mt-2 text-slate-500">
              / {duration}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-3"
            >
              <Check className="h-5 w-5 text-green-600" />

              <span>{feature}</span>
            </div>
          ))}
        </div>

        <Button
          fullWidth
          variant={popular ? "primary" : "outline"}
          className="mt-8"
        >
          Choose Plan
        </Button>
      </Card>
    </motion.div>
  );
}
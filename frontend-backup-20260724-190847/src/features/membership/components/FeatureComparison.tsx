"use client";

import { Fragment } from "react";
import { Check, Minus } from "lucide-react";

const features = [
  {
    category: "Profile",
    items: [
      {
        name: "Create Profile",
        free: true,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "Upload Photos",
        free: true,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "Profile Verification",
        free: false,
        silver: true,
        gold: true,
        platinum: true,
      },
    ],
  },

  {
    category: "Search",
    items: [
      {
        name: "Basic Search",
        free: true,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "Advanced Search",
        free: false,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "Priority Search Results",
        free: false,
        silver: true,
        gold: true,
        platinum: true,
      },
    ],
  },

  {
    category: "Communication",
    items: [
      {
        name: "Express Interest",
        free: true,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "Unlimited Chat",
        free: false,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "View Contact Details",
        free: false,
        silver: true,
        gold: true,
        platinum: true,
      },
    ],
  },

  {
    category: "Premium",
    items: [
      {
        name: "Highlighted Profile",
        free: false,
        silver: false,
        gold: true,
        platinum: true,
      },
      {
        name: "Dedicated Relationship Manager",
        free: false,
        silver: false,
        gold: false,
        platinum: true,
      },
      {
        name: "VIP Support",
        free: false,
        silver: false,
        gold: true,
        platinum: true,
      },
    ],
  },
];

function Cell({ value }: { value: boolean }) {
  return (
    <td className="px-4 py-4 text-center">
      {value ? (
        <Check className="mx-auto text-green-600" size={20} />
      ) : (
        <Minus className="mx-auto text-gray-300" size={20} />
      )}
    </td>
  );
}

export default function FeatureComparison() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold">
            Compare Membership Plans
          </h2>

          <p className="mt-4 text-gray-600">
            See what's included in each membership plan.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border shadow-sm">
          <table className="min-w-full border-collapse">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-6 py-5 text-left">
                  Features
                </th>

                <th className="px-4 py-5 text-center">
                  Free
                </th>

                <th className="px-4 py-5 text-center">
                  Silver
                </th>

                <th className="px-4 py-5 text-center">
                  Gold
                </th>

                <th className="px-4 py-5 text-center">
                  Platinum
                </th>
              </tr>
            </thead>

            <tbody>
              {features.map((group) => (
                <Fragment key={group.category}>
                  <tr className="bg-gray-100">
                    <td
                      colSpan={5}
                      className="px-6 py-4 font-bold"
                    >
                      {group.category}
                    </td>
                  </tr>

                  {group.items.map((item) => (
                    <tr
                      key={item.name}
                      className="border-t"
                    >
                      <td className="px-6 py-4">
                        {item.name}
                      </td>

                      <Cell value={item.free} />
                      <Cell value={item.silver} />
                      <Cell value={item.gold} />
                      <Cell value={item.platinum} />
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}